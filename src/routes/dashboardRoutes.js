const express = require('express');
const router = express.Router();

// Importar controllers
const DashboardController = require('../controllers/dashboardController');
const ProgressController = require('../controllers/progressController');
const TeamController = require('../controllers/teamController');
const AdminController = require('../controllers/adminController');
const ModalController = require('../controllers/modalController');
const RankingController = require('../controllers/rankingController');

// Importar middlewares
const { dashboardMiddleware, dashboardAPIMiddleware } = require('../middlewares/dashboardAuthMiddleware');
const { requirePTD, requireGestor, requireAdmin } = require('../middlewares/roleBasedMiddleware');
const ValidationMiddleware = require('../middlewares/validationMiddleware');
const rateLimiter = require('../middlewares/rateLimitMiddleware');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// ============================================================================
// ROTAS DE PÁGINAS (RENDERIZAÇÃO)
// ============================================================================

/**
 * Página principal do dashboard - GET /dashboard
 */
router.get('/dashboard', 
  dashboardMiddleware,
  DashboardController.verifyDashboardAccess,
  rateLimiter.dashboard,
  cacheMiddleware.smart,
  DashboardController.renderDashboard
);

/**
 * Redirecionamento para trilha específica - GET /trilha/:trailId
 */
router.get('/trilha/:trailId', 
  dashboardMiddleware,
  ValidationMiddleware.validateIdParam('trailId'),
  ProgressController.redirectToTrail
);

// ============================================================================
// ROTAS DE API GERAL DO DASHBOARD
// ============================================================================

/**
 * Dados gerais do dashboard - GET /api/dashboard/data
 */
router.get('/api/dashboard/data',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.smart,
  DashboardController.getDashboardData
);

/**
 * Notificações do usuário - GET /api/dashboard/notifications
 */
router.get('/api/dashboard/notifications',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  DashboardController.getNotifications
);

/**
 * Atualizar dados em tempo real - GET /api/dashboard/refresh
 */
router.get('/api/dashboard/refresh',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  DashboardController.refreshDashboardData
);

/**
 * Verificar permissões - GET /api/dashboard/permissions
 */
router.get('/api/dashboard/permissions',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  DashboardController.checkPermissions
);

/**
 * Estatísticas gerais - GET /api/dashboard/stats
 */
router.get('/api/dashboard/stats',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.smart,
  DashboardController.getGeneralStats
);

// ============================================================================
// ROTAS ESPECÍFICAS PARA PTD (id_role = 3)
// ============================================================================

/**
 * Dados específicos do PTD - GET /api/dashboard/ptd
 */
router.get('/api/dashboard/ptd',
  dashboardAPIMiddleware,
  requirePTD,
  rateLimiter.generalAPI,
  cacheMiddleware.ptdDashboard,
  DashboardController.getPTDDashboardData
);

/**
 * Trilhas ativas do PTD - GET /api/progress/trails/active
 */
router.get('/api/progress/trails/active',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.trailProgress,
  ProgressController.getActiveTrails
);

/**
 * Trilhas atribuídas pelo gestor - GET /api/progress/trails/assigned
 */
router.get('/api/progress/trails/assigned',
  dashboardAPIMiddleware,
  requirePTD,
  rateLimiter.generalAPI,
  cacheMiddleware.trailProgress,
  ProgressController.getAssignedTrails
);

/**
 * Progresso de trilha específica - GET /api/progress/trail/:trailId
 */
router.get('/api/progress/trail/:trailId',
  dashboardAPIMiddleware,
  ValidationMiddleware.validateIdParam('trailId'),
  rateLimiter.generalAPI,
  ProgressController.getTrailProgress
);

/**
 * Módulos de uma trilha - GET /api/progress/trail/:trailId/modules
 */
router.get('/api/progress/trail/:trailId/modules',
  dashboardAPIMiddleware,
  ValidationMiddleware.validateIdParam('trailId'),
  rateLimiter.generalAPI,
  ProgressController.getTrailModulesProgress
);

/**
 * Iniciar trilha - POST /api/progress/trail/:trailId/start
 */
router.post('/api/progress/trail/:trailId/start',
  dashboardAPIMiddleware,
  ValidationMiddleware.validateIdParam('trailId'),
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  ProgressController.startTrail
);

/**
 * Marcar aula como concluída - POST /api/progress/class/:classId/complete
 */
router.post('/api/progress/class/:classId/complete',
  dashboardAPIMiddleware,
  ValidationMiddleware.validateIdParam('classId'),
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  ProgressController.completeClass
);

/**
 * Ranking geral de PTDs - GET /api/ranking/ptd-general
 */
router.get('/api/ranking/ptd-general',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.ranking,
  RankingController.getPTDGeneralRanking
);

/**
 * Posição no ranking (próprio usuário) - GET /api/ranking/ptd-position
 */
router.get('/api/ranking/ptd-position',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.ranking,
  RankingController.getPTDRankingPosition
);

/**
 * Posição no ranking (usuário específico) - GET /api/ranking/ptd-position/:ptdId
 */
router.get('/api/ranking/ptd-position/:ptdId',
  dashboardAPIMiddleware,
  ValidationMiddleware.validateIdParam('ptdId'),
  rateLimiter.generalAPI,
  cacheMiddleware.ranking,
  RankingController.getPTDRankingPosition
);

// ============================================================================
// ROTAS ESPECÍFICAS PARA GESTOR (id_role = 2)
// ============================================================================

/**
 * Dados específicos do Gestor - GET /api/dashboard/gestor
 */
router.get('/api/dashboard/gestor',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  cacheMiddleware.gestorDashboard,
  DashboardController.getGestorDashboardData
);

/**
 * Membros da equipe - GET /api/team/members
 */
router.get('/api/team/members',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  cacheMiddleware.teamData,
  TeamController.getTeamMembers
);

/**
 * PTDs disponíveis para adicionar - GET /api/team/available-ptds
 */
router.get('/api/team/available-ptds',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  TeamController.getAvailablePTDs
);

/**
 * Adicionar PTD à equipe - POST /api/team/add-ptd
 */
router.post('/api/team/add-ptd',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.sanitizeInput,
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  TeamController.addPTDToTeam
);

/**
 * Remover PTD da equipe - DELETE /api/team/remove-ptd/:ptdId
 */
router.delete('/api/team/remove-ptd/:ptdId',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateIdParam('ptdId'),
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  TeamController.removePTDFromTeam
);

/**
 * Ranking da equipe - GET /api/team/ranking
 */
router.get('/api/team/ranking',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  cacheMiddleware.ranking,
  RankingController.getTeamRanking
);

/**
 * Atribuir trilha a PTD - POST /api/team/assign-trail
 */
router.post('/api/team/assign-trail',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateAssignTrail,
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  TeamController.assignTrailToPTD
);

/**
 * Trilhas disponíveis para atribuição - GET /api/team/available-trails
 */
router.get('/api/team/available-trails',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  TeamController.getAvailableTrails
);

/**
 * Progresso da equipe em trilhas - POST /api/progress/team/trails
 */
router.post('/api/progress/team/trails',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.sanitizeInput,
  rateLimiter.generalAPI,
  ProgressController.getTeamTrailsProgress
);

/**
 * Progresso de PTD específico - GET /api/progress/ptd/:ptdId/trails
 */
router.get('/api/progress/ptd/:ptdId/trails',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateIdParam('ptdId'),
  rateLimiter.generalAPI,
  ProgressController.getPTDAllTrails
);

/**
 * Criar PTD - POST /api/team/create-ptd
 */
router.post('/api/team/create-ptd',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateCreatePTD,
  rateLimiter.userCreation,
  cacheMiddleware.autoInvalidate,
  TeamController.createPTD
);

/**
 * Estatísticas da equipe - GET /api/team/statistics
 */
router.get('/api/team/statistics',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  cacheMiddleware.teamData,
  TeamController.getTeamStatistics
);

// ============================================================================
// ROTAS ESPECÍFICAS PARA ADMIN (id_role = 1)
// ============================================================================

/**
 * Dados específicos do Admin - GET /api/dashboard/admin
 */
router.get('/api/dashboard/admin',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.adminDashboard,
  DashboardController.getAdminDashboardData
);

/**
 * PTDs por trilha - GET /api/admin/analytics/ptds-per-trail
 */
router.get('/api/admin/analytics/ptds-per-trail',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.analytics,
  AdminController.getPTDsPerTrail
);

/**
 * Média de completude das trilhas - GET /api/admin/analytics/trail-completion
 */
router.get('/api/admin/analytics/trail-completion',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.analytics,
  AdminController.getTrailCompletion
);

/**
 * Cards mais favoritados - GET /api/admin/analytics/most-favorited-cards
 */
router.get('/api/admin/analytics/most-favorited-cards',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.analytics,
  AdminController.getMostFavoritedCards
);

/**
 * Cards menos favoritados - GET /api/admin/analytics/least-favorited-cards
 */
router.get('/api/admin/analytics/least-favorited-cards',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.analytics,
  AdminController.getLeastFavoritedCards
);

/**
 * Estatísticas da plataforma - GET /api/admin/analytics/platform-stats
 */
router.get('/api/admin/analytics/platform-stats',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.generalAPI,
  cacheMiddleware.analytics,
  AdminController.getPlatformStats
);

/**
 * Criar Gestor ou Admin - POST /api/admin/create-user
 */
router.post('/api/admin/create-user',
  dashboardAPIMiddleware,
  requireAdmin,
  ValidationMiddleware.validateCreateGestorAdmin,
  rateLimiter.userCreation,
  cacheMiddleware.autoInvalidate,
  AdminController.createGestorOrAdmin
);

/**
 * Listar usuários - GET /api/admin/users
 */
router.get('/api/admin/users',
  dashboardAPIMiddleware,
  requireAdmin,
  ValidationMiddleware.validatePagination,
  ValidationMiddleware.validateSearchFilters,
  rateLimiter.generalAPI,
  AdminController.getUsers
);

// ============================================================================
// ROTAS DE MODAIS
// ============================================================================

/**
 * Modal: Adicionar PTD à equipe - POST /api/modals/add-ptd-to-team
 */
router.post('/api/modals/add-ptd-to-team',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.sanitizeInput,
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  ModalController.addPTDToTeamModal
);

/**
 * Modal: Atribuir trilha - POST /api/modals/assign-trail-to-ptd
 */
router.post('/api/modals/assign-trail-to-ptd',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateAssignTrail,
  rateLimiter.criticalActions,
  cacheMiddleware.autoInvalidate,
  ModalController.assignTrailModal
);

/**
 * Modal: Criar PTD - POST /api/modals/create-ptd
 */
router.post('/api/modals/create-ptd',
  dashboardAPIMiddleware,
  requireGestor,
  ValidationMiddleware.validateCreatePTD,
  rateLimiter.userCreation,
  cacheMiddleware.autoInvalidate,
  ModalController.createPTDModal
);

/**
 * Modal: Criar Gestor/Admin - POST /api/modals/create-gestor-admin
 */
router.post('/api/modals/create-gestor-admin',
  dashboardAPIMiddleware,
  requireAdmin,
  ValidationMiddleware.validateCreateGestorAdmin,
  rateLimiter.userCreation,
  cacheMiddleware.autoInvalidate,
  ModalController.createGestorAdminModal
);

/**
 * Dados para modal de adicionar PTD - GET /api/modals/add-ptd-data
 */
router.get('/api/modals/add-ptd-data',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  ModalController.getAddPTDModalData
);

/**
 * Dados para modal de atribuir trilha - GET /api/modals/assign-trail-data
 */
router.get('/api/modals/assign-trail-data',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  ModalController.getAssignTrailModalData
);

/**
 * Buscar PTDs disponíveis - GET /api/modals/search-available-ptds
 */
router.get('/api/modals/search-available-ptds',
  dashboardAPIMiddleware,
  requireGestor,
  rateLimiter.generalAPI,
  ModalController.searchAvailablePTDs
);

// ============================================================================
// ROTAS UTILITÁRIAS
// ============================================================================

/**
 * Estatísticas de cache (Admin) - GET /api/dashboard/cache-stats
 */
router.get('/api/dashboard/cache-stats',
  dashboardAPIMiddleware,
  requireAdmin,
  cacheMiddleware.statsMiddleware
);

/**
 * Estatísticas de rate limit (Admin) - GET /api/dashboard/rate-limit-stats
 */
router.get('/api/dashboard/rate-limit-stats',
  dashboardAPIMiddleware,
  requireAdmin,
  rateLimiter.statsMiddleware
);

/**
 * Dados consolidados de ranking - GET /api/ranking/dashboard-data
 */
router.get('/api/ranking/dashboard-data',
  dashboardAPIMiddleware,
  rateLimiter.generalAPI,
  cacheMiddleware.ranking,
  RankingController.getDashboardRankingData
);

// ============================================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// ============================================================================

router.use((error, req, res, next) => {
  console.error('❌ [DASHBOARD ROUTES] Erro:', error);
  
  // Se for requisição AJAX/API
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.startsWith('/api/')) {
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
  
  // Se for requisição de página
  return res.status(500).render('pages/error', {
    title: 'Erro Interno',
    message: 'Ocorreu um erro interno no servidor'
  });
});

module.exports = router;