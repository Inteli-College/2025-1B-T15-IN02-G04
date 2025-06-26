const { DashboardModel } = require('../models');

/**
 * Factory function para criar middleware de verificação de role
 * @param {number|Array} requiredRoles - Role(s) necessário(s) (1=Admin, 2=Gestor, 3=PTD)
 * @param {Object} options - Opções adicionais
 * @returns {Function} Middleware function
 */
const requireRole = (requiredRoles, options = {}) => {
  const {
    allowHigherRoles = true, // Se true, roles menores (mais altos) têm acesso
    errorMessage = 'Acesso negado',
    redirectTo = null, // Para onde redirecionar em caso de erro (se não for API)
    logAccess = true
  } = options;

  // Normalizar para array
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const userRoles = req.userRoles;
      
      if (!userId || !userRoles) {
        console.log('❌ [ROLE] Usuário não autenticado');
        return handleUnauthorized(req, res, 'Usuário não autenticado', redirectTo);
      }

      // Extrair IDs dos roles do usuário
      const userRoleIds = userRoles.map(role => role.id_role);
      
      // Verificar se o usuário tem algum dos roles necessários
      let hasAccess = false;
      
      for (const requiredRole of rolesArray) {
        if (userRoleIds.includes(requiredRole)) {
          hasAccess = true;
          break;
        }
        
        // Se allowHigherRoles for true, verificar roles superiores (menor ID = maior prioridade)
        if (allowHigherRoles) {
          const hasHigherRole = userRoleIds.some(roleId => roleId < requiredRole);
          if (hasHigherRole) {
            hasAccess = true;
            break;
          }
        }
      }

      if (!hasAccess) {
        if (logAccess) {
          console.log(`❌ [ROLE] Acesso negado - Usuário ${userId} (${userRoleIds.join(',')}) tentou acessar roles ${rolesArray.join(',')}`);
        }
        return handleUnauthorized(req, res, errorMessage, redirectTo);
      }

      if (logAccess) {
        console.log(`✅ [ROLE] Acesso permitido - Usuário ${userId} com roles ${userRoleIds.join(',')}`);
      }

      return next();

    } catch (error) {
      console.error('❌ [ROLE] Erro no middleware de role:', error);
      return handleServerError(req, res, 'Erro interno de autorização');
    }
  };
};

/**
 * Middleware específico para PTDs (role_id = 3)
 */
const requirePTD = requireRole(3, {
  errorMessage: 'Acesso negado: usuário não é PTD',
  allowHigherRoles: false
});

/**
 * Middleware específico para Gestores (role_id = 2)
 * Admins também têm acesso por padrão
 */
const requireGestor = requireRole(2, {
  errorMessage: 'Acesso negado: usuário não é Gestor',
  allowHigherRoles: true
});

/**
 * Middleware específico para Admins (role_id = 1)
 */
const requireAdmin = requireRole(1, {
  errorMessage: 'Acesso negado: usuário não é Admin',
  allowHigherRoles: false
});

/**
 * Middleware para verificar múltiplos roles (OR)
 * Usuário precisa ter pelo menos um dos roles especificados
 */
const requireAnyRole = (roles, options = {}) => {
  return requireRole(roles, {
    ...options,
    allowHigherRoles: false
  });
};

/**
 * Middleware para verificar todos os roles (AND)
 * Usuário precisa ter todos os roles especificados
 */
const requireAllRoles = (roles, options = {}) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const userRoles = req.userRoles;
      
      if (!userId || !userRoles) {
        return handleUnauthorized(req, res, 'Usuário não autenticado');
      }

      const userRoleIds = userRoles.map(role => role.id_role);
      
      // Verificar se o usuário tem todos os roles necessários
      const hasAllRoles = rolesArray.every(requiredRole => 
        userRoleIds.includes(requiredRole)
      );

      if (!hasAllRoles) {
        const missingRoles = rolesArray.filter(role => !userRoleIds.includes(role));
        console.log(`❌ [ROLE] Acesso negado - Usuário ${userId} não possui todos os roles necessários. Faltam: ${missingRoles.join(',')}`);
        
        return handleUnauthorized(req, res, options.errorMessage || 'Acesso negado: roles insuficientes');
      }

      console.log(`✅ [ROLE] Acesso permitido - Usuário ${userId} possui todos os roles necessários`);
      return next();

    } catch (error) {
      console.error('❌ [ROLE] Erro no middleware requireAllRoles:', error);
      return handleServerError(req, res, 'Erro interno de autorização');
    }
  };
};

/**
 * Middleware dinâmico baseado no role do usuário
 * Redireciona para dashboard específico baseado no role principal
 */
const roleBasedRedirect = (req, res, next) => {
  try {
    const primaryRole = req.primaryRole;
    
    if (!primaryRole) {
      console.log('❌ [ROLE] Role principal não encontrado');
      return res.redirect('/login');
    }

    // Definir redirecionamentos baseados no role
    const roleRedirects = {
      1: '/dashboard', // Admin
      2: '/dashboard', // Gestor 
      3: '/dashboard'  // PTD
    };

    const redirectPath = roleRedirects[primaryRole.id_role];
    
    if (!redirectPath) {
      console.log(`❌ [ROLE] Role não reconhecido: ${primaryRole.id_role}`);
      return res.redirect('/login');
    }

    // Se já está na página correta, continuar
    if (req.path === redirectPath) {
      return next();
    }

    console.log(`🔄 [ROLE] Redirecionando usuário ${req.userId} (${primaryRole.role_name}) para ${redirectPath}`);
    return res.redirect(redirectPath);

  } catch (error) {
    console.error('❌ [ROLE] Erro no middleware roleBasedRedirect:', error);
    return res.redirect('/login');
  }
};

/**
 * Middleware para verificar se usuário pode acessar dados de outro usuário
 * Regras:
 * - Usuário pode acessar seus próprios dados
 * - Admin pode acessar dados de qualquer usuário
 * - Gestor pode acessar dados dos PTDs da sua equipe
 */
const canAccessUserData = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const targetUserId = parseInt(req.params.userId || req.params.ptdId || req.body.userId);
    
    if (!targetUserId) {
      return res.status(400).json({ error: 'ID do usuário não fornecido' });
    }

    // Usuário pode acessar seus próprios dados
    if (currentUserId === targetUserId) {
      return next();
    }

    // Admin pode acessar qualquer usuário
    if (req.isAdmin) {
      return next();
    }

    // Gestor pode acessar PTDs da sua equipe
    if (req.isGestor) {
      const { HierarchyModel } = require('../models');
      const canManage = await HierarchyModel.canManagePTD(currentUserId, targetUserId);
      
      if (canManage) {
        return next();
      }
    }

    console.log(`❌ [ROLE] Usuário ${currentUserId} tentou acessar dados do usuário ${targetUserId} sem permissão`);
    return handleUnauthorized(req, res, 'Acesso negado aos dados do usuário');

  } catch (error) {
    console.error('❌ [ROLE] Erro no middleware canAccessUserData:', error);
    return handleServerError(req, res, 'Erro interno de autorização');
  }
};

/**
 * Middleware para log de tentativas de acesso negado
 */
const logAccessAttempts = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log tentativas de acesso negado
    if (res.statusCode === 403 || res.statusCode === 401) {
      const userInfo = req.userId ? `Usuário ${req.userId}` : 'Usuário anônimo';
      const roleInfo = req.primaryRole ? `Role: ${req.primaryRole.role_name}` : 'Sem role';
      
      console.log(`🔒 [ACCESS DENIED] ${userInfo} - ${roleInfo} - ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    }
    
    originalSend.call(this, data);
  };
  
  return next();
};

/**
 * Função auxiliar para lidar com acesso não autorizado
 */
function handleUnauthorized(req, res, message, redirectTo = null) {
  // Se for requisição AJAX ou API, retornar JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.startsWith('/api/')) {
    return res.status(403).json({ 
      error: message,
      redirect: redirectTo || '/dashboard'
    });
  }
  
  // Se há um redirecionamento específico
  if (redirectTo) {
    return res.redirect(redirectTo);
  }
  
  // Renderizar página de erro
  return res.status(403).render('pages/error', {
    title: 'Acesso Negado',
    message: message
  });
}

/**
 * Função auxiliar para lidar com erros do servidor
 */
function handleServerError(req, res, message) {
  // Se for requisição AJAX ou API, retornar JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.startsWith('/api/')) {
    return res.status(500).json({ 
      error: message,
      redirect: '/dashboard'
    });
  }
  
  // Renderizar página de erro
  return res.status(500).render('pages/error', {
    title: 'Erro Interno',
    message: message
  });
}

module.exports = {
  requireRole,
  requirePTD,
  requireGestor,
  requireAdmin,
  requireAnyRole,
  requireAllRoles,
  roleBasedRedirect,
  canAccessUserData,
  logAccessAttempts
};