const {
  DashboardModel,
  TrailProgressModel,
  HierarchyModel,
  RankingModel,
  AnalyticsModel,
  CardModel
} = require('../models');

class DashboardController {
  /**
   * Página principal do dashboard - rota GET /dashboard
   * Renderiza o dashboard modular baseado no role do usuário
   */
  static async renderDashboard(req, res) {
    try {
      const userId = req.userId;
      
      // Buscar role do usuário
      const userRole = await DashboardModel.getUserRole(userId);
      
      if (!userRole) {
        return res.status(403).render('pages/error', {
          title: 'Erro de Acesso',
          message: 'Usuário sem permissões adequadas'
        });
      }

      // Buscar dados específicos baseado no role
      const dashboardData = await DashboardModel.getDashboardDataByRole(userId, userRole.id_role);
      
      dashboardData.user.primaryRole = userRole;

      // Atualizar última atividade
      await DashboardModel.updateLastActivity(userId);

      // Renderizar dashboard modular
      return res.render('pages/dashboard', {
        title: 'Dashboard',
        pageCSS: 'pages/dashboard.css',
        pageJS: 'dashboard.js',
        dashboardData,
        currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      return res.status(500).render('pages/error', {
        title: 'Erro Interno',
        message: 'Erro ao carregar o dashboard'
      });
    }
  }

  /**
   * API para buscar dados do dashboard via AJAX - GET /api/dashboard/data
   */
  static async getDashboardData(req, res) {
    try {
      const userId = req.userId;
      const { role } = req.query;

      // Verificar se o usuário tem o role solicitado
      const hasRole = role ? await DashboardModel.hasRole(userId, parseInt(role)) : true;
      
      if (!hasRole) {
        return res.status(403).json({ error: 'Acesso negado para este role' });
      }

      // Buscar role do usuário se não especificado
      const userRole = role ? { id_role: parseInt(role) } : await DashboardModel.getUserRole(userId);
      
      if (!userRole) {
        return res.status(404).json({ error: 'Role não encontrado' });
      }

      // Buscar dados específicos
      const dashboardData = await DashboardModel.getDashboardDataByRole(userId, userRole.id_role);
      
      return res.status(200).json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }

  /**
   * Dados específicos para PTD - GET /api/dashboard/ptd
   */
  static async getPTDDashboardData(req, res) {
    try {
      const userId = req.userId;

      // Verificar se é PTD
      const isPTD = await DashboardModel.hasRole(userId, 3);
      if (!isPTD) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é PTD' });
      }

      // Buscar dados específicos do PTD
      const [
        activeTrails,
        assignedTrails,
        favoriteCards,
        generalRanking,
        userPosition
      ] = await Promise.all([
        TrailProgressModel.getUserActiveTrails(userId),
        TrailProgressModel.getAssignedTrails(userId),
        CardModel.getUserFavoriteCards(userId),
        RankingModel.getPTDGeneralRanking(5),
        RankingModel.getPTDRankingPosition(userId)
      ]);

      return res.status(200).json({
        success: true,
        data: {
          activeTrails,
          assignedTrails,
          favoriteCards,
          ranking: {
            top5: generalRanking,
            userPosition
          }
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do PTD:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados do PTD',
        details: error.message 
      });
    }
  }

  /**
   * Dados específicos para Gestor - GET /api/dashboard/gestor
   */
  static async getGestorDashboardData(req, res) {
    try {
      const userId = req.userId;

      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }

      // Buscar dados específicos do Gestor
      const [
        teamMembers,
        teamRanking,
        teamStatistics,
        availableTrails,
        trailAssignments
      ] = await Promise.all([
        HierarchyModel.getTeamMembers(userId),
        RankingModel.getTeamRanking(userId),
        HierarchyModel.getTeamStatistics(userId),
        HierarchyModel.getAvailableTrailsForAssignment(),
        HierarchyModel.getTrailAssignmentsByGestor(userId)
      ]);

      // Buscar progresso detalhado de cada membro da equipe
      const teamProgress = [];
      for (const member of teamMembers) {
        const memberProgress = await TrailProgressModel.getPTDAllTrailsProgress(member.ptdId);
        teamProgress.push({
          ptdId: member.ptdId,
          ptdName: member.ptdName,
          trails: memberProgress
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          teamMembers,
          teamRanking,
          teamStatistics,
          teamProgress,
          availableTrails,
          trailAssignments
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do Gestor:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados do Gestor',
        details: error.message 
      });
    }
  }

  /**
   * Dados específicos para Admin - GET /api/dashboard/admin
   */
  static async getAdminDashboardData(req, res) {
    try {
      const userId = req.userId;

      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }

      // Buscar dados específicos do Admin
      const [
        platformStats,
        ptdsPerTrail,
        trailCompletionAverage,
        mostFavoritedCards,
        leastFavoritedCards,
        managerPerformance,
        recentActivity,
        engagementStats
      ] = await Promise.all([
        AnalyticsModel.getGeneralPlatformStats(),
        AnalyticsModel.getPTDsPerTrail(),
        AnalyticsModel.getTrailCompletionAverage(),
        AnalyticsModel.getMostFavoritedCards(5),
        AnalyticsModel.getLeastFavoritedCards(5),
        AnalyticsModel.getManagerPerformanceReport(),
        AnalyticsModel.getRecentActivity(30),
        AnalyticsModel.getUserEngagementStats()
      ]);

      return res.status(200).json({
        success: true,
        data: {
          platformStats,
          trailAnalytics: {
            ptdsPerTrail,
            completionAverage: trailCompletionAverage
          },
          cardAnalytics: {
            mostFavorited: mostFavoritedCards,
            leastFavorited: leastFavoritedCards
          },
          managerPerformance,
          recentActivity,
          engagementStats
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do Admin:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados do Admin',
        details: error.message 
      });
    }
  }

  /**
   * Buscar notificações do usuário - GET /api/dashboard/notifications
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.userId;
      
      const notifications = await DashboardModel.getNotifications(userId);
      
      return res.status(200).json({
        success: true,
        data: notifications
      });

    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar notificações',
        details: error.message 
      });
    }
  }

  /**
   * Atualizar dados em tempo real - GET /api/dashboard/refresh
   */
  static async refreshDashboardData(req, res) {
    try {
      const userId = req.userId;
      const { section } = req.query;

      let refreshedData = {};

      // Buscar role do usuário
      const userRole = await DashboardModel.getUserRole(userId);
      
      if (!userRole) {
        return res.status(404).json({ error: 'Role não encontrado' });
      }

      // Atualizar seção específica ou todas
      switch (section) {
        case 'ranking':
          if (userRole.id_role === 3) {
            refreshedData.ranking = {
              top5: await RankingModel.getPTDGeneralRanking(5),
              userPosition: await RankingModel.getPTDRankingPosition(userId)
            };
          } else if (userRole.id_role === 2) {
            refreshedData.teamRanking = await RankingModel.getTeamRanking(userId);
          }
          break;

        case 'progress':
          if (userRole.id_role === 3) {
            refreshedData.progress = {
              activeTrails: await TrailProgressModel.getUserActiveTrails(userId),
              assignedTrails: await TrailProgressModel.getAssignedTrails(userId)
            };
          }
          break;

        case 'team':
          if (userRole.id_role === 2) {
            refreshedData.team = {
              members: await HierarchyModel.getTeamMembers(userId),
              statistics: await HierarchyModel.getTeamStatistics(userId)
            };
          }
          break;

        case 'analytics':
          if (userRole.id_role === 1) {
            refreshedData.analytics = await AnalyticsModel.getExecutiveDashboardData();
          }
          break;

        default:
          // Atualizar todos os dados
          refreshedData = await DashboardModel.getDashboardDataByRole(userId, userRole.id_role);
          break;
      }

      return res.status(200).json({
        success: true,
        data: refreshedData,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erro ao atualizar dados do dashboard:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar dados',
        details: error.message 
      });
    }
  }

  /**
   * Verificar status de permissões - GET /api/dashboard/permissions
   */
  static async checkPermissions(req, res) {
    try {
      const userId = req.userId;
      
      const [userRoles, userData] = await Promise.all([
        DashboardModel.getUserRoles(userId),
        DashboardModel.getUserBasicData(userId)
      ]);

      const permissions = {
        isPTD: userRoles.some(role => role.id_role === 3),
        isGestor: userRoles.some(role => role.id_role === 2),
        isAdmin: userRoles.some(role => role.id_role === 1),
        roles: userRoles,
        user: userData
      };

      return res.status(200).json({
        success: true,
        data: permissions
      });

    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return res.status(500).json({ 
        error: 'Erro ao verificar permissões',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas gerais para widgets - GET /api/dashboard/stats
   */
  static async getGeneralStats(req, res) {
    try {
      const userId = req.userId;
      
      const generalStats = await DashboardModel.getGeneralStats(userId);
      
      return res.status(200).json({
        success: true,
        data: generalStats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas',
        details: error.message 
      });
    }
  }

  /**
   * Middleware para verificar acesso ao dashboard
   */
  static async verifyDashboardAccess(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Verificar se o usuário tem pelo menos um role válido
      const userRoles = await DashboardModel.getUserRoles(userId);
      
      if (!userRoles || userRoles.length === 0) {
        return res.status(403).json({ error: 'Usuário sem permissões' });
      }

      // Adicionar roles ao request para uso posterior
      req.userRoles = userRoles;
      req.primaryRole = userRoles[0]; // Role principal (menor ID)
      
      next();

    } catch (error) {
      console.error('Erro ao verificar acesso ao dashboard:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

module.exports = DashboardController;