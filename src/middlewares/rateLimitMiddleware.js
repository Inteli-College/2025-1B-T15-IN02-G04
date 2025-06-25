/**
 * Middleware de Rate Limiting para proteger APIs e dashboard
 * Implementa controle de taxa usando armazenamento em memória
 */

class RateLimitMiddleware {
  constructor() {
    // Armazenamento em memória para contadores
    this.storage = new Map();
    
    // Limpeza automática a cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Factory function para criar rate limiters específicos
   * @param {Object} options - Configurações do rate limiter
   */
  createRateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutos
      maxRequests = 100,          // Máximo de requests
      message = 'Muitas requisições. Tente novamente mais tarde.',
      keyGenerator = null,        // Função customizada para gerar chave
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      onLimitReached = null,      // Callback quando limite é atingido
      bypassCondition = null      // Condição para bypass do rate limit
    } = options;

    return (req, res, next) => {
      try {
        // Verificar condição de bypass
        if (bypassCondition && bypassCondition(req)) {
          return next();
        }

        // Gerar chave única para o cliente
        const key = keyGenerator ? keyGenerator(req) : this.getDefaultKey(req);
        
        // Obter informações do limite atual
        const now = Date.now();
        const record = this.storage.get(key) || {
          count: 0,
          resetTime: now + windowMs,
          firstRequest: now
        };

        // Reset se a janela expirou
        if (now >= record.resetTime) {
          record.count = 0;
          record.resetTime = now + windowMs;
          record.firstRequest = now;
        }

        // Verificar se excedeu o limite
        if (record.count >= maxRequests) {
          // Log da tentativa de excesso
          console.log(`🚫 [RATE LIMIT] Limite excedido para ${key} - ${record.count}/${maxRequests}`);
          
          // Callback quando limite é atingido
          if (onLimitReached) {
            onLimitReached(req, res, key, record);
          }

          // Headers informativos
          res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000)
          });

          return res.status(429).json({
            error: message,
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          });
        }

        // Incrementar contador
        record.count++;
        this.storage.set(key, record);

        // Headers informativos
        res.set({
          'X-RateLimit-Limit': maxRequests,
          'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count),
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
        });

        // Interceptar resposta para contar apenas requests com base no resultado
        const originalSend = res.send;
        res.send = function(data) {
          const statusCode = res.statusCode;
          
          // Decrementar contador se devemos pular requests com sucesso/falha
          if ((skipSuccessfulRequests && statusCode < 400) ||
              (skipFailedRequests && statusCode >= 400)) {
            record.count--;
            self.storage.set(key, record);
          }
          
          originalSend.call(this, data);
        };

        next();

      } catch (error) {
        console.error('❌ [RATE LIMIT] Erro no middleware:', error);
        next(); // Continuar em caso de erro
      }
    };
  }

  /**
   * Gera chave padrão baseada no IP e usuário
   */
  getDefaultKey(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.userId || 'anonymous';
    return `${ip}:${userId}`;
  }

  /**
   * Rate limiter para APIs gerais
   */
  generalAPI = this.createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,          // 100 requests por 15 min
    message: 'Muitas requisições à API. Tente novamente em alguns minutos.',
    keyGenerator: (req) => {
      // Diferentes limites para diferentes tipos de usuário
      const baseKey = this.getDefaultKey(req);
      if (req.isAdmin) return `admin:${baseKey}`;
      if (req.isGestor) return `gestor:${baseKey}`;
      if (req.isPTD) return `ptd:${baseKey}`;
      return `public:${baseKey}`;
    },
    onLimitReached: (req, res, key, record) => {
      console.log(`⚠️ [RATE LIMIT] API limit reached - User: ${req.userId || 'anonymous'}, IP: ${req.ip}`);
    }
  });

  /**
   * Rate limiter específico para dashboard
   */
  dashboard = this.createRateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutos
    maxRequests: 50,           // 50 requests por 10 min
    message: 'Muitas requisições ao dashboard. Aguarde alguns minutos.',
    skipSuccessfulRequests: true, // Não contar requests bem-sucedidos
    bypassCondition: (req) => req.isAdmin // Admins não têm limite
  });

  /**
   * Rate limiter restritivo para login
   */
  auth = this.createRateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    maxRequests: 5,            // Apenas 5 tentativas por 15 min
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return `auth:${ip}`;
    },
    onLimitReached: (req, res, key, record) => {
      console.log(`🔒 [RATE LIMIT] Auth limit reached - IP: ${req.ip}, Email: ${req.body.email || 'unknown'}`);
    }
  });

  /**
   * Rate limiter para criação de usuários
   */
  userCreation = this.createRateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hora
    maxRequests: 3,            // Apenas 3 criações por hora
    message: 'Limite de criação de usuários atingido. Tente novamente em 1 hora.',
    keyGenerator: (req) => {
      const userId = req.userId || 'anonymous';
      return `user-creation:${userId}`;
    },
    bypassCondition: (req) => req.isAdmin // Admins podem criar mais usuários
  });

  /**
   * Rate limiter para modais/ações críticas
   */
  criticalActions = this.createRateLimit({
    windowMs: 5 * 60 * 1000,   // 5 minutos
    maxRequests: 10,           // 10 ações por 5 min
    message: 'Muitas ações realizadas rapidamente. Aguarde alguns minutos.',
    keyGenerator: (req) => {
      const userId = req.userId || 'anonymous';
      const action = req.path.split('/').pop();
      return `critical:${userId}:${action}`;
    }
  });

  /**
   * Rate limiter para uploads/downloads
   */
  fileOperations = this.createRateLimit({
    windowMs: 10 * 60 * 1000,  // 10 minutos
    maxRequests: 20,           // 20 operações por 10 min
    message: 'Muitas operações de arquivo. Aguarde alguns minutos.',
    keyGenerator: (req) => {
      const userId = req.userId || 'anonymous';
      return `files:${userId}`;
    }
  });

  /**
   * Rate limiter progressivo (aumenta o limite baseado no tempo)
   */
  progressive = this.createRateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    maxRequests: (req) => {
      // Mais requests para usuários estabelecidos
      const userAge = req.user?.created_at ? 
        Date.now() - new Date(req.user.created_at).getTime() : 0;
      const daysOld = userAge / (1000 * 60 * 60 * 24);
      
      if (daysOld > 30) return 200;  // Usuários antigos
      if (daysOld > 7) return 150;   // Usuários de uma semana
      return 100;                    // Usuários novos
    },
    message: 'Limite de requisições excedido para sua conta.'
  });

  /**
   * Rate limiter baseado em role
   */
  roleBasedLimit(adminLimit = 1000, gestorLimit = 500, ptdLimit = 200) {
    return this.createRateLimit({
      windowMs: 15 * 60 * 1000,
      maxRequests: (req) => {
        if (req.isAdmin) return adminLimit;
        if (req.isGestor) return gestorLimit;
        if (req.isPTD) return ptdLimit;
        return 50; // Usuários não autenticados
      },
      message: 'Limite de requisições excedido para seu nível de acesso.',
      keyGenerator: (req) => {
        const userId = req.userId || 'anonymous';
        const role = req.isAdmin ? 'admin' : req.isGestor ? 'gestor' : req.isPTD ? 'ptd' : 'public';
        return `role:${role}:${userId}`;
      }
    });
  }

  /**
   * Limpeza automática de registros expirados
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, record] of this.storage.entries()) {
      if (now >= record.resetTime) {
        this.storage.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 [RATE LIMIT] Limpeza automática: ${cleaned} registros removidos`);
    }
  }

  /**
   * Obter estatísticas do rate limiter
   */
  getStats() {
    const now = Date.now();
    const stats = {
      totalKeys: this.storage.size,
      activeKeys: 0,
      expiredKeys: 0,
      topKeys: []
    };

    const keyStats = [];
    
    for (const [key, record] of this.storage.entries()) {
      if (now < record.resetTime) {
        stats.activeKeys++;
        keyStats.push({
          key,
          count: record.count,
          remaining: Math.ceil((record.resetTime - now) / 1000)
        });
      } else {
        stats.expiredKeys++;
      }
    }

    // Top 10 chaves com mais requests
    stats.topKeys = keyStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Reset manual de uma chave específica
   */
  resetKey(key) {
    const deleted = this.storage.delete(key);
    if (deleted) {
      console.log(`🔄 [RATE LIMIT] Chave resetada: ${key}`);
    }
    return deleted;
  }

  /**
   * Reset manual de todas as chaves de um usuário
   */
  resetUser(userId) {
    let resetCount = 0;
    
    for (const [key, record] of this.storage.entries()) {
      if (key.includes(userId)) {
        this.storage.delete(key);
        resetCount++;
      }
    }
    
    console.log(`🔄 [RATE LIMIT] ${resetCount} chaves resetadas para usuário ${userId}`);
    return resetCount;
  }

  /**
   * Middleware para mostrar estatísticas (Admin apenas)
   */
  statsMiddleware = (req, res, next) => {
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const stats = this.getStats();
    res.json({
      success: true,
      data: stats
    });
  };
}

// Instância singleton
const rateLimiter = new RateLimitMiddleware();

module.exports = rateLimiter;