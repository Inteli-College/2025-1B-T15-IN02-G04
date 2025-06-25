const db = require('../config/db');

class DashboardModel {
  /**
   * Busca dados gerais do usuário para o dashboard
   * @param {number} userId - ID do usuário
   * @returns {Object} Dados básicos do usuário
   */
  static async getUserBasicData(userId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".email,
          "user".score,
          "user".avatar,
          ru.id_role,
          r.role_name
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        JOIN role r ON ru.id_role = r.id
        WHERE "user".id = $1
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar dados básicos do usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica o papel/role principal do usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} Role do usuário
   */
  static async getUserRole(userId) {
    try {
      const result = await db.query(`
        SELECT ru.id_role, r.role_name
        FROM role_user ru
        JOIN role r ON ru.id_role = r.id
        WHERE ru.id_user = $1
        ORDER BY ru.id_role ASC
        LIMIT 1
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar role do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca todos os roles de um usuário (pode ter múltiplos)
   * @param {number} userId - ID do usuário
   * @returns {Array} Array de roles
   */
  static async getUserRoles(userId) {
    try {
      const result = await db.query(`
        SELECT ru.id_role, r.role_name, r.description
        FROM role_user ru
        JOIN role r ON ru.id_role = r.id
        WHERE ru.id_user = $1
        ORDER BY ru.id_role ASC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      throw error;
    }
  }

  /**
   * Verifica se usuário tem permissão específica
   * @param {number} userId - ID do usuário
   * @param {number} requiredRole - Role necessário (1=Admin, 2=Gestor, 3=PTD)
   * @returns {boolean} Se tem permissão
   */
  static async hasRole(userId, requiredRole) {
    try {
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM role_user
        WHERE id_user = $1 AND id_role = $2
      `, [userId, requiredRole]);

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas gerais para o dashboard
   * @param {number} userId - ID do usuário
   * @returns {Object} Estatísticas gerais
   */
  static async getGeneralStats(userId) {
    try {
      const result = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM trail_user WHERE id_user = $1) as total_trails_started,
          (SELECT COUNT(*) FROM trail_user WHERE id_user = $1 AND percentage = 100) as trails_completed,
          (SELECT COUNT(*) FROM card_user WHERE id_user = $1) as favorite_cards,
          (SELECT COALESCE(AVG(percentage), 0) FROM trail_user WHERE id_user = $1) as avg_progress
      `, [userId]);

      const stats = result.rows[0];
      return {
        totalTrailsStarted: parseInt(stats.total_trails_started),
        trailsCompleted: parseInt(stats.trails_completed),
        favoriteCards: parseInt(stats.favorite_cards),
        avgProgress: Math.round(parseFloat(stats.avg_progress))
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais:', error);
      throw error;
    }
  }

  /**
   * Busca dados específicos baseado no role do usuário
   * @param {number} userId - ID do usuário
   * @param {number} roleId - ID do role
   * @returns {Object} Dados específicos do dashboard
   */
  static async getDashboardDataByRole(userId, roleId) {
    try {
      const basicData = await this.getUserBasicData(userId);
      const generalStats = await this.getGeneralStats(userId);

      const dashboardData = {
        user: basicData,
        stats: generalStats,
        roleId: roleId
      };

      // Adicionar dados específicos baseado no role
      switch (roleId) {
        case 1: // Admin
          dashboardData.adminData = await this.getAdminSpecificData(userId);
          break;
        case 2: // Gestor
          dashboardData.gestorData = await this.getGestorSpecificData(userId);
          break;
        case 3: // PTD
          dashboardData.ptdData = await this.getPTDSpecificData(userId);
          break;
      }

      return dashboardData;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard por role:', error);
      throw error;
    }
  }

  /**
   * Dados específicos para Admin
   */
  static async getAdminSpecificData(userId) {
    try {
      const result = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM "user" JOIN role_user ru ON "user".id = ru.id_user WHERE ru.id_role = 3) as total_ptds,
          (SELECT COUNT(*) FROM "user" JOIN role_user ru ON "user".id = ru.id_user WHERE ru.id_role = 2) as total_gestors,
          (SELECT COUNT(*) FROM trail) as total_trails,
          (SELECT COUNT(*) FROM card) as total_cards
      `);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar dados específicos do admin:', error);
      throw error;
    }
  }

  /**
   * Dados específicos para Gestor
   */
  static async getGestorSpecificData(userId) {
    try {
      // Buscar PTDs da equipe do gestor
      const teamResult = await db.query(`
        SELECT COUNT(*) as team_size
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        WHERE ru1.id_user = $1 AND ru2.id_role = 3
      `, [userId]);

      return {
        teamSize: parseInt(teamResult.rows[0].team_size)
      };
    } catch (error) {
      console.error('Erro ao buscar dados específicos do gestor:', error);
      throw error;
    }
  }

  /**
   * Dados específicos para PTD
   */
  static async getPTDSpecificData(userId) {
    try {
      const result = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM trail_user WHERE id_user = $1) as trails_enrolled,
          (SELECT COUNT(*) FROM hierarchy_trail ht 
           JOIN hierarchy h ON ht.id_hierarchy = h.id
           JOIN role_user ru ON h.id_role_user2 = ru.id
           WHERE ru.id_user = $1) as assigned_trails,
          (SELECT COUNT(*) FROM card_user WHERE id_user = $1) as favorite_cards
      `, [userId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar dados específicos do PTD:', error);
      throw error;
    }
  }

  /**
   * Busca notificações ou alertas para o dashboard
   * @param {number} userId - ID do usuário
   * @returns {Array} Lista de notificações
   */
  static async getNotifications(userId) {
    try {
      // Por enquanto retorna array vazio, pode ser expandido futuramente
      const notifications = [];

      // Verificar trilhas com baixo progresso
      const lowProgressResult = await db.query(`
        SELECT t.name
        FROM trail_user tu
        JOIN trail t ON tu.id_trail = t.id
        WHERE tu.id_user = $1 
        AND tu.percentage < 25 
        AND tu.started_at < NOW() - INTERVAL '7 days'
      `, [userId]);

      lowProgressResult.rows.forEach(row => {
        notifications.push({
          type: 'warning',
          message: `Trilha "${row.name}" com baixo progresso`,
          action: 'continue_trail'
        });
      });

      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  /**
   * Atualiza última atividade do usuário
   * @param {number} userId - ID do usuário
   */
  static async updateLastActivity(userId) {
    try {
      await db.query(`
        UPDATE "user" 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [userId]);
    } catch (error) {
      console.error('Erro ao atualizar última atividade:', error);
      throw error;
    }
  }
}

module.exports = DashboardModel;