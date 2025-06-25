const { AnalyticsModel, DashboardModel, UserModel } = require('../models');
const bcrypt = require('bcrypt');
const db = require('../config/db');

class AdminController {
  /**
   * Buscar analytics de PTDs por trilha - GET /api/admin/analytics/ptds-per-trail
   */
  static async getPTDsPerTrail(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const ptdsPerTrail = await AnalyticsModel.getPTDsPerTrail();
      
      return res.status(200).json({
        success: true,
        data: ptdsPerTrail
      });

    } catch (error) {
      console.error('Erro ao buscar PTDs por trilha:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar PTDs por trilha',
        details: error.message 
      });
    }
  }

  /**
   * Buscar média de completude das trilhas - GET /api/admin/analytics/trail-completion
   */
  static async getTrailCompletion(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const trailCompletion = await AnalyticsModel.getTrailCompletionAverage();
      
      return res.status(200).json({
        success: true,
        data: trailCompletion
      });

    } catch (error) {
      console.error('Erro ao buscar completude das trilhas:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar completude das trilhas',
        details: error.message 
      });
    }
  }

  /**
   * Buscar cards mais favoritados - GET /api/admin/analytics/most-favorited-cards
   */
  static async getMostFavoritedCards(req, res) {
    try {
      const userId = req.userId;
      const { limit = 5 } = req.query;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const mostFavorited = await AnalyticsModel.getMostFavoritedCards(parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: mostFavorited
      });

    } catch (error) {
      console.error('Erro ao buscar cards mais favoritados:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar cards mais favoritados',
        details: error.message 
      });
    }
  }

  /**
   * Buscar cards menos favoritados - GET /api/admin/analytics/least-favorited-cards
   */
  static async getLeastFavoritedCards(req, res) {
    try {
      const userId = req.userId;
      const { limit = 5 } = req.query;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const leastFavorited = await AnalyticsModel.getLeastFavoritedCards(parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: leastFavorited
      });

    } catch (error) {
      console.error('Erro ao buscar cards menos favoritados:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar cards menos favoritados',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas gerais da plataforma - GET /api/admin/analytics/platform-stats
   */
  static async getPlatformStats(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const platformStats = await AnalyticsModel.getGeneralPlatformStats();
      
      return res.status(200).json({
        success: true,
        data: platformStats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas da plataforma:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas da plataforma',
        details: error.message 
      });
    }
  }

  /**
   * Buscar atividade recente - GET /api/admin/analytics/recent-activity
   */
  static async getRecentActivity(req, res) {
    try {
      const userId = req.userId;
      const { days = 7 } = req.query;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const recentActivity = await AnalyticsModel.getRecentActivity(parseInt(days));
      
      return res.status(200).json({
        success: true,
        data: recentActivity
      });

    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar atividade recente',
        details: error.message 
      });
    }
  }

  /**
   * Buscar estatísticas de engagement - GET /api/admin/analytics/engagement
   */
  static async getEngagementStats(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const engagementStats = await AnalyticsModel.getUserEngagementStats();
      
      return res.status(200).json({
        success: true,
        data: engagementStats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas de engagement:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar estatísticas de engagement',
        details: error.message 
      });
    }
  }

  /**
   * Buscar relatório de performance dos gestores - GET /api/admin/analytics/manager-performance
   */
  static async getManagerPerformance(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const managerPerformance = await AnalyticsModel.getManagerPerformanceReport();
      
      return res.status(200).json({
        success: true,
        data: managerPerformance
      });

    } catch (error) {
      console.error('Erro ao buscar performance dos gestores:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar performance dos gestores',
        details: error.message 
      });
    }
  }

  /**
   * Buscar dados do dashboard executivo - GET /api/admin/analytics/executive-dashboard
   */
  static async getExecutiveDashboard(req, res) {
    try {
      const userId = req.userId;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const executiveData = await AnalyticsModel.getExecutiveDashboardData();
      
      return res.status(200).json({
        success: true,
        data: executiveData
      });

    } catch (error) {
      console.error('Erro ao buscar dados executivos:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar dados executivos',
        details: error.message 
      });
    }
  }

  /**
   * Buscar métricas de crescimento - GET /api/admin/analytics/growth-metrics
   */
  static async getGrowthMetrics(req, res) {
    try {
      const userId = req.userId;
      const { months = 6 } = req.query;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const growthMetrics = await AnalyticsModel.getGrowthMetrics(parseInt(months));
      
      return res.status(200).json({
        success: true,
        data: growthMetrics
      });

    } catch (error) {
      console.error('Erro ao buscar métricas de crescimento:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar métricas de crescimento',
        details: error.message 
      });
    }
  }

  /**
   * Criar novo Gestor ou Admin - POST /api/admin/create-user
   */
  static async createGestorOrAdmin(req, res) {
    try {
      const userId = req.userId;
      const { name, email, username, password, id_role } = req.body;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      // Validações básicas
      if (!name || !email || !username || !password || !id_role) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios',
          required: ['name', 'email', 'username', 'password', 'id_role']
        });
      }
      
      // Validar role (apenas 1=Admin ou 2=Gestor)
      if (![1, 2].includes(parseInt(id_role))) {
        return res.status(400).json({ 
          error: 'Role inválido. Use 1 para Admin ou 2 para Gestor' 
        });
      }
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }
      
      // Validar senha (mínimo 8 caracteres para admins/gestores)
      if (password.length < 8) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 8 caracteres' });
      }
      
      try {
        // Criptografar senha
        const saltRounds = 12; // Mais seguro para admins/gestores
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Iniciar transação
        await db.query('BEGIN');
        
        try {
          // Criar usuário na tabela user
          const userResult = await db.query(
            'INSERT INTO "user" (name, email, username, password) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, username, hashedPassword]
          );
          
          const newUserId = userResult.rows[0].id;
          
          // Atribuir role
          await db.query(
            'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2)',
            [newUserId, parseInt(id_role)]
          );
          
          await db.query('COMMIT');
          
          const roleNames = { 1: 'Admin', 2: 'Gestor' };
          const roleName = roleNames[parseInt(id_role)];
          
          return res.status(201).json({
            success: true,
            message: `${roleName} criado com sucesso`,
            data: {
              id: newUserId,
              name,
              email,
              username,
              role: roleName
            }
          });
          
        } catch (innerError) {
          await db.query('ROLLBACK');
          throw innerError;
        }
        
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
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao criar usuário',
        details: error.message 
      });
    }
  }

  /**
   * Buscar todos os usuários com filtros - GET /api/admin/users
   */
  static async getUsers(req, res) {
    try {
      const userId = req.userId;
      const { role, page = 1, limit = 20, search } = req.query;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.username,
          u.score,
          u.created_at,
          array_agg(
            json_build_object(
              'id_role', ru.id_role,
              'role_name', r.role_name
            )
          ) as roles
        FROM "user" u
        JOIN role_user ru ON u.id = ru.id_user
        JOIN role r ON ru.id_role = r.id
      `;
      
      const params = [];
      const conditions = [];
      
      if (role && !isNaN(role)) {
        conditions.push(`ru.id_role = $${params.length + 1}`);
        params.push(parseInt(role));
      }
      
      if (search) {
        conditions.push(`(u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += `
        GROUP BY u.id, u.name, u.email, u.username, u.score, u.created_at
        ORDER BY u.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;
      
      params.push(parseInt(limit), offset);
      
      // Buscar contagem total
      let countQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM "user" u
        JOIN role_user ru ON u.id = ru.id_user
      `;
      
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      const [usersResult, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2)) // Remover limit e offset
      ]);
      
      const totalCount = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalCount / parseInt(limit));
      
      return res.status(200).json({
        success: true,
        data: usersResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ 
        error: 'Erro ao buscar usuários',
        details: error.message 
      });
    }
  }

  /**
   * Atualizar role de um usuário - PUT /api/admin/users/:userId/role
   */
  static async updateUserRole(req, res) {
    try {
      const userId = req.userId;
      const { userId: targetUserId } = req.params;
      const { id_role, action } = req.body; // action: 'add' ou 'remove'
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      if (!id_role || isNaN(id_role)) {
        return res.status(400).json({ error: 'Role inválido' });
      }
      
      if (!['add', 'remove'].includes(action)) {
        return res.status(400).json({ error: 'Ação inválida. Use "add" ou "remove"' });
      }
      
      // Verificar se o usuário existe
      const targetUser = await UserModel.buscarPorId(parseInt(targetUserId));
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Não permitir modificar o próprio role de admin
      if (parseInt(targetUserId) === userId && parseInt(id_role) === 1 && action === 'remove') {
        return res.status(403).json({ error: 'Não é possível remover seu próprio role de admin' });
      }
      
      try {
        if (action === 'add') {
          await db.query(
            'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [parseInt(targetUserId), parseInt(id_role)]
          );
        } else {
          await db.query(
            'DELETE FROM role_user WHERE id_user = $1 AND id_role = $2',
            [parseInt(targetUserId), parseInt(id_role)]
          );
        }
        
        return res.status(200).json({
          success: true,
          message: `Role ${action === 'add' ? 'adicionado' : 'removido'} com sucesso`
        });
        
      } catch (dbError) {
        throw dbError;
      }

    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      return res.status(500).json({ 
        error: 'Erro ao atualizar role',
        details: error.message 
      });
    }
  }

  /**
   * Deletar usuário - DELETE /api/admin/users/:userId
   */
  static async deleteUser(req, res) {
    try {
      const userId = req.userId;
      const { userId: targetUserId } = req.params;
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ error: 'ID do usuário inválido' });
      }
      
      // Não permitir deletar a si mesmo
      if (parseInt(targetUserId) === userId) {
        return res.status(403).json({ error: 'Não é possível deletar seu próprio usuário' });
      }
      
      // Verificar se o usuário existe
      const targetUser = await UserModel.buscarPorId(parseInt(targetUserId));
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      try {
        await db.query('DELETE FROM "user" WHERE id = $1', [parseInt(targetUserId)]);
        
        return res.status(200).json({
          success: true,
          message: 'Usuário deletado com sucesso'
        });
        
      } catch (dbError) {
        throw dbError;
      }

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao deletar usuário',
        details: error.message 
      });
    }
  }

  /**
   * Middleware para verificar se é admin
   */
  static async verifyAdminAccess(req, res, next) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      // Verificar se é Admin
      const isAdmin = await DashboardModel.hasRole(userId, 1);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Acesso negado: usuário não é Admin' });
      }
      
      next();

    } catch (error) {
      console.error('Erro ao verificar acesso de admin:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: error.message 
      });
    }
  }
}

module.exports = AdminController;