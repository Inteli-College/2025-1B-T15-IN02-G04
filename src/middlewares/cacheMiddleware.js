/**
 * Middleware de Cache para melhorar performance do dashboard
 * Implementa cache em memória com invalidação inteligente
 */

class CacheMiddleware {
  constructor() {
    // Armazenamento em memória para cache
    this.cache = new Map();
    this.lastAccess = new Map();
    
    // Limpeza automática a cada 10 minutos
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Factory function para criar middlewares de cache específicos
   * @param {Object} options - Configurações do cache
   */
  createCache(options = {}) {
    const {
      ttl = 5 * 60 * 1000,           // TTL padrão: 5 minutos
      keyGenerator = null,            // Função customizada para gerar chave
      condition = null,               // Condição para cachear
      invalidateOn = [],              // Eventos que invalidam o cache
      vary = ['userId'],              // Parâmetros que afetam a chave
      maxSize = 1000,                 // Tamanho máximo do cache
      skipOnError = true,             // Pular cache em caso de erro
      serialize = JSON.stringify,     // Função de serialização
      deserialize = JSON.parse        // Função de deserialização
    } = options;

    return (req, res, next) => {
      try {
        // Verificar condição de cache
        if (condition && !condition(req)) {
          return next();
        }

        // Apenas cachear GET requests por padrão
        if (req.method !== 'GET') {
          return next();
        }

        // Gerar chave de cache
        const cacheKey = keyGenerator ? keyGenerator(req) : this.generateKey(req, vary);
        
        // Verificar se existe no cache
        const cached = this.get(cacheKey, ttl);
        if (cached) {
          console.log(`💾 [CACHE] Cache hit para: ${cacheKey}`);
          
          // Atualizar último acesso
          this.lastAccess.set(cacheKey, Date.now());
          
          // Adicionar headers de cache
          res.set({
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey.substring(0, 50), // Apenas primeiros 50 chars
            'Cache-Control': `max-age=${Math.floor(ttl / 1000)}`
          });
          
          return res.status(cached.statusCode).json(cached.data);
        }

        console.log(`🔍 [CACHE] Cache miss para: ${cacheKey}`);

        // Interceptar resposta para cachear
        const originalSend = res.send;
        const originalJson = res.json;
        let responseSent = false;

        res.send = function(data) {
          if (!responseSent) {
            responseSent = true;
            try {
              // Cachear apenas respostas de sucesso
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const cacheData = {
                  statusCode: res.statusCode,
                  data: typeof data === 'string' ? JSON.parse(data) : data,
                  timestamp: Date.now(),
                  headers: res.getHeaders()
                };
                
                self.set(cacheKey, cacheData, ttl, maxSize);
                console.log(`💾 [CACHE] Cached response para: ${cacheKey}`);
              }
            } catch (error) {
              if (!skipOnError) {
                console.error('❌ [CACHE] Erro ao cachear:', error);
              }
            }
          }
          originalSend.call(this, data);
        };

        res.json = function(data) {
          if (!responseSent) {
            responseSent = true;
            try {
              // Cachear apenas respostas de sucesso
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const cacheData = {
                  statusCode: res.statusCode,
                  data,
                  timestamp: Date.now(),
                  headers: res.getHeaders()
                };
                
                self.set(cacheKey, cacheData, ttl, maxSize);
                console.log(`💾 [CACHE] Cached JSON response para: ${cacheKey}`);
              }
            } catch (error) {
              if (!skipOnError) {
                console.error('❌ [CACHE] Erro ao cachear JSON:', error);
              }
            }
          }
          originalJson.call(this, data);
        };

        // Adicionar headers de cache miss
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey.substring(0, 50)
        });

        next();

      } catch (error) {
        console.error('❌ [CACHE] Erro no middleware de cache:', error);
        if (skipOnError) {
          next();
        } else {
          res.status(500).json({ error: 'Erro interno de cache' });
        }
      }
    };
  }

  /**
   * Gera chave de cache baseada na requisição
   */
  generateKey(req, vary = ['userId']) {
    const parts = [req.path];
    
    // Adicionar parâmetros que variam
    vary.forEach(param => {
      switch (param) {
        case 'userId':
          parts.push(`user:${req.userId || 'anonymous'}`);
          break;
        case 'role':
          const role = req.isAdmin ? 'admin' : req.isGestor ? 'gestor' : req.isPTD ? 'ptd' : 'public';
          parts.push(`role:${role}`);
          break;
        case 'query':
          const queryString = Object.keys(req.query)
            .sort()
            .map(key => `${key}=${req.query[key]}`)
            .join('&');
          if (queryString) parts.push(`query:${queryString}`);
          break;
        case 'headers':
          // Apenas headers específicos
          const relevantHeaders = ['accept-language', 'user-agent'];
          relevantHeaders.forEach(header => {
            if (req.headers[header]) {
              parts.push(`${header}:${req.headers[header]}`);
            }
          });
          break;
        default:
          if (req[param]) {
            parts.push(`${param}:${req[param]}`);
          }
      }
    });

    return parts.join('|');
  }

  /**
   * Armazenar no cache
   */
  set(key, value, ttl, maxSize = 1000) {
    // Verificar limite de tamanho
    if (this.cache.size >= maxSize) {
      this.evictLRU();
    }

    const entry = {
      value,
      expiry: Date.now() + ttl,
      created: Date.now()
    };

    this.cache.set(key, entry);
    this.lastAccess.set(key, Date.now());
  }

  /**
   * Recuperar do cache
   */
  get(key, ttl = null) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar expiração
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.lastAccess.delete(key);
      return null;
    }

    // Atualizar último acesso
    this.lastAccess.set(key, Date.now());
    
    return entry.value;
  }

  /**
   * Invalidar cache por padrão de chave
   */
  invalidate(pattern) {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.lastAccess.delete(key);
        invalidated++;
      }
    }
    
    if (invalidated > 0) {
      console.log(`🗑️ [CACHE] Invalidated ${invalidated} entries matching pattern: ${pattern}`);
    }
    
    return invalidated;
  }

  /**
   * Invalidar cache de um usuário específico
   */
  invalidateUser(userId) {
    return this.invalidate(`user:${userId}`);
  }

  /**
   * Invalidar cache por role
   */
  invalidateRole(role) {
    return this.invalidate(`role:${role}`);
  }

  /**
   * Limpar cache completamente
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.lastAccess.clear();
    console.log(`🗑️ [CACHE] Cleared all cache (${size} entries)`);
    return size;
  }

  /**
   * Remover entradas menos utilizadas (LRU)
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.lastAccess.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.lastAccess.delete(oldestKey);
      console.log(`🗑️ [CACHE] Evicted LRU entry: ${oldestKey}`);
    }
  }

  /**
   * Limpeza automática de entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        this.lastAccess.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 [CACHE] Cleanup: ${cleaned} expired entries removed`);
    }
  }

  /**
   * Cache específico para dashboard de PTD
   */
  ptdDashboard = this.createCache({
    ttl: 3 * 60 * 1000, // 3 minutos
    keyGenerator: (req) => `dashboard:ptd:${req.userId}`,
    condition: (req) => req.isPTD,
    vary: ['userId']
  });

  /**
   * Cache específico para dashboard de Gestor
   */
  gestorDashboard = this.createCache({
    ttl: 5 * 60 * 1000, // 5 minutos
    keyGenerator: (req) => `dashboard:gestor:${req.userId}`,
    condition: (req) => req.isGestor,
    vary: ['userId']
  });

  /**
   * Cache específico para dashboard de Admin
   */
  adminDashboard = this.createCache({
    ttl: 10 * 60 * 1000, // 10 minutos
    keyGenerator: (req) => `dashboard:admin:${req.userId}`,
    condition: (req) => req.isAdmin,
    vary: ['userId']
  });

  /**
   * Cache para rankings
   */
  ranking = this.createCache({
    ttl: 15 * 60 * 1000, // 15 minutos
    keyGenerator: (req) => {
      const role = req.isAdmin ? 'admin' : req.isGestor ? 'gestor' : 'ptd';
      const query = new URLSearchParams(req.query).toString();
      return `ranking:${role}:${req.userId}:${query}`;
    },
    vary: ['userId', 'role', 'query']
  });

  /**
   * Cache para analytics (Admin)
   */
  analytics = this.createCache({
    ttl: 30 * 60 * 1000, // 30 minutos
    keyGenerator: (req) => `analytics:${req.path}:${new URLSearchParams(req.query).toString()}`,
    condition: (req) => req.isAdmin,
    vary: ['query']
  });

  /**
   * Cache para dados de equipe (Gestor)
   */
  teamData = this.createCache({
    ttl: 5 * 60 * 1000, // 5 minutos
    keyGenerator: (req) => `team:${req.userId}:${req.path}`,
    condition: (req) => req.isGestor,
    vary: ['userId']
  });

  /**
   * Cache para progresso de trilhas
   */
  trailProgress = this.createCache({
    ttl: 2 * 60 * 1000, // 2 minutos
    keyGenerator: (req) => {
      const trailId = req.params.trailId || '';
      return `progress:${req.userId}:${trailId}`;
    },
    vary: ['userId']
  });

  /**
   * Cache inteligente que se adapta ao tipo de dados
   */
  smart = this.createCache({
    ttl: (req) => {
      // TTL dinâmico baseado no tipo de dados
      if (req.path.includes('analytics')) return 30 * 60 * 1000; // 30 min
      if (req.path.includes('ranking')) return 15 * 60 * 1000;   // 15 min
      if (req.path.includes('progress')) return 2 * 60 * 1000;   // 2 min
      return 5 * 60 * 1000; // 5 min padrão
    },
    keyGenerator: (req) => {
      const role = req.isAdmin ? 'admin' : req.isGestor ? 'gestor' : req.isPTD ? 'ptd' : 'public';
      const path = req.path.replace(/\/\d+/g, '/:id'); // Normalizar IDs
      const query = Object.keys(req.query).length > 0 ? `:${new URLSearchParams(req.query).toString()}` : '';
      return `smart:${role}:${req.userId}:${path}${query}`;
    },
    vary: ['userId', 'role', 'query']
  });

  /**
   * Middleware para invalidação automática
   */
  autoInvalidate = (req, res, next) => {
    // Interceptar métodos que modificam dados
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const originalSend = res.send;
      const originalJson = res.json;
      
      const invalidateCache = () => {
        // Invalidar cache baseado na rota
        if (req.path.includes('/team/')) {
          this.invalidate(`team:${req.userId}`);
        }
        if (req.path.includes('/progress/')) {
          this.invalidate(`progress:${req.userId}`);
        }
        if (req.path.includes('/ranking/')) {
          this.invalidate('ranking:');
        }
        if (req.path.includes('/admin/')) {
          this.invalidate('analytics:');
        }
        
        // Invalidar dashboard do usuário
        this.invalidateUser(req.userId);
      };

      res.send = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCache();
        }
        originalSend.call(this, data);
      };

      res.json = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCache();
        }
        originalJson.call(this, data);
      };
    }
    
    next();
  };

  /**
   * Estatísticas do cache
   */
  getStats() {
    const now = Date.now();
    const stats = {
      totalEntries: this.cache.size,
      memoryUsage: this.getMemoryUsage(),
      hitRate: this.getHitRate(),
      oldestEntry: null,
      newestEntry: null,
      expiredEntries: 0,
      entriesByTTL: {
        expired: 0,
        expiring1min: 0,
        expiring5min: 0,
        expiring15min: 0,
        expiring30min: 0,
        longTerm: 0
      }
    };

    let oldestTime = now;
    let newestTime = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.created;
      const timeToExpire = entry.expiry - now;

      if (entry.created < oldestTime) {
        oldestTime = entry.created;
        stats.oldestEntry = { key, age };
      }
      
      if (entry.created > newestTime) {
        newestTime = entry.created;
        stats.newestEntry = { key, age };
      }

      if (timeToExpire <= 0) {
        stats.entriesByTTL.expired++;
      } else if (timeToExpire <= 60 * 1000) {
        stats.entriesByTTL.expiring1min++;
      } else if (timeToExpire <= 5 * 60 * 1000) {
        stats.entriesByTTL.expiring5min++;
      } else if (timeToExpire <= 15 * 60 * 1000) {
        stats.entriesByTTL.expiring15min++;
      } else if (timeToExpire <= 30 * 60 * 1000) {
        stats.entriesByTTL.expiring30min++;
      } else {
        stats.entriesByTTL.longTerm++;
      }
    }

    return stats;
  }

  /**
   * Calcular uso aproximado de memória
   */
  getMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // String chars são 2 bytes
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 64; // Overhead aproximado do objeto
    }
    
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round(totalSize / (1024 * 1024))
    };
  }

  /**
   * Calcular taxa de hit aproximada
   */
  getHitRate() {
    // Esta seria uma implementação mais complexa que rastrearia hits/misses
    // Por simplicidade, retornamos uma estimativa baseada no tamanho do cache
    const size = this.cache.size;
    if (size === 0) return 0;
    if (size < 10) return 0.3;
    if (size < 50) return 0.5;
    if (size < 200) return 0.7;
    return 0.8;
  }

  /**
   * Middleware para estatísticas (Admin apenas)
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
const cacheMiddleware = new CacheMiddleware();

module.exports = cacheMiddleware;