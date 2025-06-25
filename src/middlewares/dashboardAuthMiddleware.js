const jwt = require("jsonwebtoken");
const { DashboardModel } = require('../models');

/**
 * Middleware específico para autenticação no dashboard
 * Verifica token e carrega dados do usuário com roles
 */
const dashboardAuth = async (req, res, next) => {
  try {
    // Extrair token do cookie
    const token = req.cookies.token;

    if (!token) {
      console.log('📝 [DASHBOARD] Token não encontrado, redirecionando para login');
      
      // Se for requisição AJAX, retornar JSON
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ 
          error: 'Token de acesso requerido',
          redirect: '/login'
        });
      }
      
      // Se for requisição normal, redirecionar
      return res.redirect('/login');
    }

    try {
      // Verificar e decodificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      console.log('🔐 [DASHBOARD] Token válido para usuário:', userId);

      // Buscar dados completos do usuário com roles
      const [userData, userRoles] = await Promise.all([
        DashboardModel.getUserBasicData(userId),
        DashboardModel.getUserRoles(userId)
      ]);

      if (!userData) {
        console.log('❌ [DASHBOARD] Usuário não encontrado:', userId);
        throw new Error('Usuário não encontrado');
      }

      if (!userRoles || userRoles.length === 0) {
        console.log('❌ [DASHBOARD] Usuário sem roles válidos:', userId);
        throw new Error('Usuário sem permissões');
      }

      // Adicionar dados ao request
      req.userId = userId;
      req.user = userData;
      req.userRoles = userRoles;
      req.primaryRole = userRoles[0]; // Role principal (menor ID = maior prioridade)
      
      // Flags de conveniência para verificações rápidas
    const roleNames = userRoles.map(role => role.role_name.toLowerCase());
    req.isPTD = roleNames.includes('ptd');
    req.isGestor = roleNames.includes('gestor');
    req.isAdmin = roleNames.includes('admin');;

      console.log('✅ [DASHBOARD] Autenticação bem-sucedida:', {
        userId,
        name: userData.name,
        primaryRole: req.primaryRole.role_name,
        isPTD: req.isPTD,
        isGestor: req.isGestor,
        isAdmin: req.isAdmin
      });

      return next();

    } catch (jwtError) {
      console.log('❌ [DASHBOARD] Token inválido:', jwtError.message);
      
      // Limpar cookie inválido
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
      });

      // Se for requisição AJAX, retornar JSON
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ 
          error: 'Token inválido',
          redirect: '/login'
        });
      }
      
      // Se for requisição normal, redirecionar
      return res.redirect('/login');
    }

  } catch (error) {
    console.error('❌ [DASHBOARD] Erro no middleware de autenticação:', error);
    
    // Se for requisição AJAX, retornar JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ 
        error: 'Erro interno de autenticação',
        redirect: '/login'
      });
    }
    
    // Se for requisição normal, renderizar página de erro
    return res.status(500).render('pages/error', {
      title: 'Erro de Autenticação',
      message: 'Erro interno do servidor durante autenticação'
    });
  }
};

/**
 * Middleware para verificar se usuário está logado (versão leve)
 * Apenas verifica token sem carregar dados completos
 */
const checkLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.isLoggedIn = false;
      req.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.isLoggedIn = true;
      req.userId = decoded.id;
    } catch (jwtError) {
      req.isLoggedIn = false;
      req.userId = null;
      
      // Limpar cookie inválido
      res.clearCookie("token");
    }

    return next();

  } catch (error) {
    console.error('❌ [DASHBOARD] Erro no middleware checkLoggedIn:', error);
    req.isLoggedIn = false;
    req.userId = null;
    return next();
  }
};

/**
 * Middleware para redirecionar usuários logados
 * Útil para páginas como login que não devem ser acessadas por usuários logados
 */
const redirectIfLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('🔄 [DASHBOARD] Usuário já logado, redirecionando para dashboard');
      return res.redirect('/dashboard');
      
    } catch (jwtError) {
      // Token inválido, limpar e continuar
      res.clearCookie("token");
      return next();
    }

  } catch (error) {
    console.error('❌ [DASHBOARD] Erro no middleware redirectIfLoggedIn:', error);
    return next();
  }
};

/**
 * Middleware para atualizar última atividade
 */
const updateLastActivity = async (req, res, next) => {
  try {
    if (req.userId) {
      // Atualizar em background (não aguardar)
      DashboardModel.updateLastActivity(req.userId).catch(error => {
        console.error('❌ [DASHBOARD] Erro ao atualizar última atividade:', error);
      });
    }
    
    return next();
    
  } catch (error) {
    console.error('❌ [DASHBOARD] Erro no middleware updateLastActivity:', error);
    return next(); // Continuar mesmo com erro
  }
};

/**
 * Middleware para log de acesso
 */
const logAccess = (req, res, next) => {
  try {
    const timestamp = new Date().toISOString();
    const userInfo = req.user ? `${req.user.name} (ID: ${req.userId})` : 'Anônimo';
    const roleInfo = req.primaryRole ? req.primaryRole.role_name : 'Sem role';
    
    console.log(`📊 [DASHBOARD ACCESS] ${timestamp} - ${userInfo} - ${roleInfo} - ${req.method} ${req.originalUrl}`);
    
    return next();
    
  } catch (error) {
    console.error('❌ [DASHBOARD] Erro no middleware logAccess:', error);
    return next(); // Continuar mesmo com erro
  }
};

/**
 * Middleware composto para páginas do dashboard
 * Combina autenticação, atualização de atividade e log
 */
const dashboardMiddleware = [
  dashboardAuth,
  updateLastActivity,
  logAccess
];

/**
 * Middleware composto para APIs do dashboard
 * Similar ao dashboardMiddleware mas sem log detalhado
 */
const dashboardAPIMiddleware = [
  dashboardAuth,
  updateLastActivity
];

module.exports = {
  dashboardAuth,
  checkLoggedIn,
  redirectIfLoggedIn,
  updateLastActivity,
  logAccess,
  dashboardMiddleware,
  dashboardAPIMiddleware
};