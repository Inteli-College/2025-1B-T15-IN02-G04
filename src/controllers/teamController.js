const { HierarchyModel, DashboardModel, RankingModel, UserModel } = require('../models');
const bcrypt = require('bcrypt');

class TeamController {
  /**
   * Buscar membros da equipe - GET /api/team/members
   */
  static async getTeamMembers(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const teamMembers = await HierarchyModel.getTeamMembers(userId);
      
      return res.status(200).json({
        success: true,
        data: teamMembers
      });

    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar membros da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Buscar PTDs disponíveis para adicionar à equipe - GET /api/team/available-ptds
   */
  static async getAvailablePTDs(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const availablePTDs = await HierarchyModel.getAvailablePTDs(userId);
      
      return res.status(200).json({
        success: true,
        data: availablePTDs
      });

    } catch (error) {
      console.error('Erro ao buscar PTDs disponíveis:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar PTDs disponíveis',
        details: error.message 
      });
    }
  }

  /**
   * Adicionar PTD à equipe - POST /api/team/add-ptd
   */
  static async addPTDToTeam(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.body;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ error: 'ID do PTD inválido' });
      }
      
      // Verificar se o PTD existe e tem role adequado
      const ptdUser = await UserModel.buscarPorId(parseInt(ptdId));
      if (!ptdUser) {
        return res.status(404).json({ error: 'PTD não encontrado' });
      }
      
      const isPTD = await DashboardModel.hasRole(parseInt(ptdId), 3);
      if (!isPTD) {
        return res.status(400).json({ error: 'Usuário não é um PTD' });
      }
      
      const relationship = await HierarchyModel.addPTDToTeam(userId, parseInt(ptdId));
      
      return res.status(201).json({
        success: true,
        message: 'PTD adicionado à equipe com sucesso',
        data: relationship
      });

    } catch (error) {
      console.error('Erro ao adicionar PTD à equipe:', error);
      
      if (error.message === 'PTD já está na equipe') {
        return res.status(409).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro ao adicionar PTD à equipe',
        details: error.message 
      });
    }
  }

  /**
   * Remover PTD da equipe - DELETE /api/team/remove-ptd/:ptdId
   */
  static async removePTDFromTeam(req, res) {
    try {
      const userId = req.userId;
      const { ptdId } = req.params;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ error: 'ID do PTD inválido' });
      }
      
      // Verificar se o PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (!canManage) {
        return res.status(404).json({ error: 'PTD não está na sua equipe' });
      }
      
      const removed = await HierarchyModel.removePTDFromTeam(userId, parseInt(ptdId));
      
      if (!removed) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'PTD removido da equipe com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover PTD da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao remover PTD da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Buscar ranking da equipe - GET /api/team/ranking
   */
  static async getTeamRanking(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const teamRanking = await RankingModel.getTeamRanking(userId);
      
      return res.status(200).json({
        success: true,
        data: teamRanking
      });

    } catch (error) {
      console.error('Erro ao buscar ranking da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar ranking da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Atribuir trilha a um PTD - POST /api/team/assign-trail
   */
  static async assignTrailToPTD(req, res) {
    try {
      const userId = req.userId;
      const { ptdId, trailId, permissions } = req.body;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ error: 'ID do PTD inválido' });
      }
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      // Verificar se o PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (!canManage) {
        return res.status(403).json({ error: 'PTD não está na sua equipe' });
      }
      
      const assignment = await HierarchyModel.assignTrailToPTD(
        userId, 
        parseInt(ptdId), 
        parseInt(trailId), 
        permissions
      );
      
      return res.status(201).json({
        success: true,
        message: 'Trilha atribuída com sucesso',
        data: assignment
      });

    } catch (error) {
      console.error('Erro ao atribuir trilha:', error);
      
      if (error.message === 'PTD não está na equipe do gestor' || 
          error.message === 'Trilha já foi atribuída a este PTD') {
        return res.status(409).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: 'Erro ao atribuir trilha',
        details: error.message 
      });
    }
  }

  /**
   * Remover atribuição de trilha - DELETE /api/team/remove-trail-assignment
   */
  static async removeTrailAssignment(req, res) {
    try {
      const userId = req.userId;
      const { ptdId, trailId } = req.body;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      if (!ptdId || isNaN(ptdId)) {
        return res.status(400).json({ error: 'ID do PTD inválido' });
      }
      
      if (!trailId || isNaN(trailId)) {
        return res.status(400).json({ error: 'ID da trilha inválido' });
      }
      
      // Verificar se o PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (!canManage) {
        return res.status(403).json({ error: 'PTD não está na sua equipe' });
      }
      
      const removed = await HierarchyModel.removeTrailAssignment(
        userId, 
        parseInt(ptdId), 
        parseInt(trailId)
      );
      
      if (!removed) {
        return res.status(404).json({ error: 'Atribuição não encontrada' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Atribuição removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      return res.status(500).json({ 
        error: 'Erro ao remover atribuição',
        details: error.message 
      });
    }
  }

  /**
   * Buscar trilhas disponíveis para atribuição - GET /api/team/available-trails
   */
  static async getAvailableTrails(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const availableTrails = await HierarchyModel.getAvailableTrailsForAssignment();
      
      return res.status(200).json({
        success: true,
        data: availableTrails
      });

    } catch (error) {
      console.error('Erro ao buscar trilhas disponíveis:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar trilhas disponíveis',
        details: error.message 
      });
    }
  }

  /**
   * Buscar atribuições de trilhas do gestor - GET /api/team/trail-assignments
   */
  static async getTrailAssignments(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const assignments = await HierarchyModel.getTrailAssignmentsByGestor(userId);
      
      return res.status(200).json({
        success: true,
        data: assignments
      });

    } catch (error) {
      console.error('Erro ao buscar atribuições:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar atribuições',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas da equipe - GET /api/team/statistics
   */
  static async getTeamStatistics(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const statistics = await HierarchyModel.getTeamStatistics(userId);
      
      return res.status(200).json({
        success: true,
        data: statistics
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Criar novo PTD - POST /api/team/create-ptd
   */
  static async createPTD(req, res) {
    try {
      const userId = req.userId;
      const { name, email, username, password } = req.body;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      // Validações básicas
      if (!name || !email || !username || !password) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios',
          required: ['name', 'email', 'username', 'password']
        });
      }
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }
      
      // Validar senha (mínimo 6 caracteres)
      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }
      
      try {
        // Criptografar senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Criar usuário na tabela user
        const userResult = await db.query(
          'INSERT INTO "user" (name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id',
          [name, email, username, hashedPassword]
        );
        
        const newUserId = userResult.rows[0].id;
        
        // Atribuir role PTD (id_role = 3)
        await db.query(
          'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2)',
          [newUserId, 3]
        );
        
        // Adicionar automaticamente à equipe do gestor
        await HierarchyModel.addPTDToTeam(userId, newUserId);
        
        return res.status(201).json({
          success: true,
          message: 'PTD criado e adicionado à equipe com sucesso',
          data: {
            id: newUserId,
            name,
            email,
            username
          }
        });
        
      } catch (dbError) {
        // Tratar erros específicos de banco de dados
        if (dbError.code === '23505') { // Unique violation
          if (dbError.constraint.includes('email')) {
            return res.status(409).json({ error: 'Email já está em uso' });
          }
          if (dbError.constraint.includes('username')) {
            return res.status(409).json({ error: 'Username já está em uso' });
          }
        }
        throw dbError;
      }

    } catch (error) {
      console.error('Erro ao criar PTD:', error);
      return res.status(500).json({ 
        error: 'Erro ao criar PTD',
        details: error.message 
      });
    }
  }

  /**
   * Buscar comparativo de performance da equipe - GET /api/team/performance
   */
  static async getTeamPerformance(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      const performance = await RankingModel.getTeamPerformanceComparison(userId);
      
      return res.status(200).json({
        success: true,
        data: performance
      });

    } catch (error) {
      console.error('Erro ao buscar performance da equipe:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar performance da equipe',
        details: error.message 
      });
    }
  }

  /**
   * Middleware para verificar se PTD está na equipe do gestor
   */
  static async verifyTeamAccess(req, res, next) {
    try {
      const userId = req.userId;
      const ptdId = req.params.ptdId || req.body.ptdId;
      
      if (!ptdId) {
        return res.status(400).json({ error: 'ID do PTD não fornecido' });
      }
      
      // Verificar se é Gestor
      const isGestor = await DashboardModel.hasRole(userId, 2);
      if (!isGestor) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Gestor' });
      }
      
      // Verificar se o PTD está na equipe
      const canManage = await HierarchyModel.canManagePTD(userId, parseInt(ptdId));
      if (!canManage) {
        return res.status(403).json({ error: 'PTD não está na sua equipe' });
      }
      
      req.ptdId = parseInt(ptdId);
      next();

    } catch (error) {
      console.error('Erro ao verificar acesso à equipe:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

module.exports = TeamController;