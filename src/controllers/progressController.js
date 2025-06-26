const { TrailProgressModel, DashboardModel } = require('../models');

class ProgressController {
  /**
   * Buscar trilhas ativas do usuário - GET /api/progress/trails/active
   */
  static async getActiveTrails(req, res) {
    try {
      const userId = req.userId;
      
      const activeTrails = await TrailProgressModel.getUserActiveTrails(userId);
      
      return res.status(200).json({
        success: true,
        data: activeTrails
      });

    } catch (error) {
      console.error('Erro ao buscar trilhas ativas:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar trilhas ativas',
        details: error.message 
      });
    }
  }

  /**
   * Buscar trilhas atribuídas pelo gestor - GET /api/progress/trails/assigned
   */
  static async getAssignedTrails(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é PTD
      const isPTD = await DashboardModel.hasRole(userId, 3);
      if (!isPTD) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é PTD' });
      }
      
      const assignedTrails = await TrailProgressModel.getAssignedTrails(userId);
      
      return res.status(200).json({
        success: true,
        data: assignedTrails
      });

    } catch (error) {
      console.error('Erro ao buscar trilhas atribuídas:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar trilhas atribuídas',
        details: error.message 
      });
    }
  }

  /**
   * Buscar progresso detalhado de uma trilha - GET /api/progress/trail/:trailId
   */
  static async getTrailProgress(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      const trailProgress = await TrailProgressModel.getTrailDetailedProgress(userId, parseInt(trailId));
      
      if (!trailProgress) {
        return res.status(404).json({ error: 'Trilha não encontrada' });
      }
      
      return res.status(200).json({
        success: true,
        data: trailProgress
      });

    } catch (error) {
      console.error('Erro ao buscar progresso da trilha:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar progresso da trilha',
        details: error.message 
      });
    }
  }

  /**
   * Buscar módulos de uma trilha com progresso - GET /api/progress/trail/:trailId/modules
   */
  static async getTrailModulesProgress(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      const modulesProgress = await TrailProgressModel.getTrailModulesProgress(userId, parseInt(trailId));
      
      return res.status(200).json({
        success: true,
        data: modulesProgress
      });

    } catch (error) {
      console.error('Erro ao buscar progresso dos módulos:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar progresso dos módulos',
        details: error.message 
      });
    }
  }

  /**
   * Iniciar uma trilha - POST /api/progress/trail/:trailId/start
   */
  static async startTrail(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      const startedTrail = await TrailProgressModel.startTrail(userId, parseInt(trailId));
      
      return res.status(201).json({
        success: true,
        message: 'Trilha iniciada com sucesso',
        data: startedTrail
      });

    } catch (error) {
      console.error('Erro ao iniciar trilha:', error);
      return res.status(500).json({ 
        error: 'Erro ao iniciar trilha',
        details: error.message 
      });
    }
  }

  /**
   * Marcar aula como concluída - POST /api/progress/class/:classId/complete
   */
  static async completeClass(req, res) {
    try {
      const userId = req.userId;
      const { classId } = req.params;
      
      if (!classId || isNaN(classId)) {
        return res.status(400).json({ error: 'ID da aula inválido' });
      }
      
      const completedClass = await TrailProgressModel.completeClass(userId, parseInt(classId));
      
      return res.status(200).json({
        success: true,
        message: 'Aula concluída com sucesso',
        data: completedClass
      });

    } catch (error) {
      console.error('Erro ao concluir aula:', error);
      return res.status(500).json({ 
        error: 'Erro ao concluir aula',
        details: error.message 
      });
    }
  }

  /**
   * Atualizar progresso de uma trilha - PUT /api/progress/trail/:trailId/update
   */
  static async updateTrailProgress(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      const updatedProgress = await TrailProgressModel.updateTrailProgress(userId, parseInt(trailId));
      
      return res.status(200).json({
        success: true,
        message: 'Progresso atualizado com sucesso',
        data: updatedProgress
      });

    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar progresso',
        details: error.message 
      });
    }
  }

  /**
   * Buscar progresso de múltiplos usuários (para gestores) - POST /api/progress/team/trails
   */
  static async getTeamTrailsProgress(req, res) {
    try {
      const userId = req.userId;
      const { userIds, trailId } = req.body;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: 'Lista de usuários inválida' });
      }
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      // Verificar se todos os PTDs estão na equipe do gestor
      const teamMembers = await HierarchyModel.getTeamMembers(userId);
      const teamUserIds = teamMembers.map(member => member.ptdId);
      const unauthorizedUsers = userIds.filter(id => !teamUserIds.includes(id));
      
      if (unauthorizedUsers.length > 0) {
        return res.status(403).json({ 
          error: 'Acesso negado: alguns usuários não estão na sua equipe',
          unauthorizedUsers 
        });
      }
      
      const progress = await TrailProgressModel.getMultipleUsersTrailProgress(userIds, parseInt(trailId));
      
      return res.status(200).json({
        success: true,
        data: progress
      });

    } catch (error) {
      console.error('Erro ao buscar progresso da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar progresso da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Buscar todas as trilhas de um PTD (para gestores) - GET /api/progress/ptd/:ptdId/trails
   */
  static async getPTDAllTrails(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.params;
      
      // Verificar se é Gestor ou Admin
      const isGestor = await DashboardModel.hasRole(userId, 2);
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      
      if (!isGestor && !isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor nem Admin' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ error: 'ID do PTD inválido' });
      }
      
      // Se for gestor, verificar se o PTD está na equipe
      if (isGestor && !isAdmin) {
        const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
        if (!canManage) {
          return res.status(403).json({ error: 'PTD não está na sua equipe' });
        }
      }
      
      const ptdTrails = await TrailProgressModel.getPTDAllTrailsProgress(parseInt(ptdId));
      
      return res.status(200).json({
        success: true,
        data: ptdTrails
      });

    } catch (error) {
      console.error('Erro ao buscar trilhas do PTD:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar trilhas do PTD',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas de progresso do usuário - GET /api/progress/stats
   */
  static async getProgressStats(req, res) {
    try {
      const userId = req.userId;
      
      const [activeTrails, assignedTrails] = await Promise.all([
        TrailProgressModel.getUserActiveTrails(userId),
        TrailProgressModel.getAssignedTrails(userId)
      ]);
      
      // Calcular estatísticas
      const stats = {
        totalActiveTrails: activeTrails.length,
        totalAssignedTrails: assignedTrails.length,
        completedTrails: activeTrails.filter(trail => trail.status === 'completed').length,
        inProgressTrails: activeTrails.filter(trail => trail.status === 'in_progress').length,
        notStartedTrails: activeTrails.filter(trail => trail.status === 'not_started').length,
        avgProgress: activeTrails.length > 0 
          ? Math.round(activeTrails.reduce((sum, trail) => sum + trail.percentage, 0) / activeTrails.length)
          : 0
      };
      
      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de progresso:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas de progresso',
        details: error.message 
      });
    }
  }

  /**
   * Redirecionar para trilha específica - GET /progress/trail/:trailId
   * (Rota de redirecionamento para o frontend)
   */
  static async redirectToTrail(req, res) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).render('pages/error', {
          title: 'Erro',
          message: 'ID da trilha inválido'
        });
      }
      
      // Verificar se o usuário tem acesso à trilha
      const trailProgress = await TrailProgressModel.getTrailDetailedProgress(userId, parseInt(trailId));
      
      if (!trailProgress) {
        // Se não tem progresso, tentar iniciar a trilha
        try {
          await TrailProgressModel.startTrail(userId, parseInt(trailId));
        } catch (startError) {
          console.error('Erro ao iniciar trilha automaticamente:', startError);
          return res.status(404).render('pages/error', {
            title: 'Trilha não encontrada',
            message: 'A trilha solicitada não foi encontrada ou você não tem acesso a ela'
          });
        }
      }
      
      // Redirecionar para a página da trilha (assumindo que existe uma rota /trilha/:id)
      return res.redirect(`/trilha/${trailId}`);

    } catch (error) {
      console.error('Erro ao redirecionar para trilha:', error);
      return res.status(500).render('pages/error', {
        title: 'Erro Interno',
        message: 'Erro ao acessar a trilha'
      });
    }
  }

  /**
   * Middleware para verificar acesso a trilhas
   */
  static async verifyTrailAccess(req, res, next) {
    try {
      const userId = req.userId;
      const { trailId } = req.params;
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      // Verificar se o usuário tem acesso à trilha
      const hasAccess = await TrailProgressModel.getTrailDetailedProgress(userId, parseInt(trailId));
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado à trilha' });
      }
      
      req.trailId = parseInt(trailId);
      next();

    } catch (error) {
      console.error('Erro ao verificar acesso à trilha:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

module.exports = ProgressController;