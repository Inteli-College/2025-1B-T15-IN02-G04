const db = require('../config/db');

class AnalyticsModel {
  /**
   * Busca número de PTDs por trilha (PPT - PTD Por Trilha)
   * @returns {Array} Estatísticas de PTDs por trilha
   */
  static async getPTDsPerTrail() {
    try {
      const result = await db.query(`
        SELECT 
          t.id as trail_id,
          t.name as trail_name,
          t.description,
          COUNT(DISTINCT tu.id_user) as ptd_count,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_user END) as completed_count,
          COUNT(DISTINCT CASE WHEN tu.percentage > 0 AND tu.percentage < 100 THEN tu.id_user END) as in_progress_count,
          COALESCE(AVG(tu.percentage), 0) as avg_completion
        FROM trail t
        LEFT JOIN trail_user tu ON t.id = tu.id_trail
        LEFT JOIN role_user ru ON tu.id_user = ru.id_user AND ru.id_role = 3
        GROUP BY t.id, t.name, t.description
        ORDER BY ptd_count DESC, t.name ASC
      `);

      return result.rows.map(row => ({
        trailId: row.trail_id,
        trailName: row.trail_name,
        description: row.description,
        ptdCount: parseInt(row.ptd_count),
        completedCount: parseInt(row.completed_count),
        inProgressCount: parseInt(row.in_progress_count),
        avgCompletion: Math.round(parseFloat(row.avg_completion))
      }));
    } catch (error) {
      console.error('Erro ao buscar PTDs por trilha:', error);
      throw error;
    }
  }

  /**
   * Busca média de completude das trilhas (MCT - Média de Completude das Trilhas)
   * @returns {Array} Média de completude por trilha
   */
  static async getTrailCompletionAverage() {
    try {
      const result = await db.query(`
        SELECT 
          t.id as trail_id,
          t.name as trail_name,
          COUNT(DISTINCT tu.id_user) as total_users,
          COALESCE(AVG(tu.percentage), 0) as avg_completion,
          COALESCE(STDDEV(tu.percentage), 0) as completion_stddev,
          MIN(tu.percentage) as min_completion,
          MAX(tu.percentage) as max_completion,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_user END) as completed_users,
          COUNT(DISTINCT CASE WHEN tu.percentage = 0 THEN tu.id_user END) as not_started_users
        FROM trail t
        LEFT JOIN trail_user tu ON t.id = tu.id_trail
        WHERE tu.id_user IS NOT NULL
        GROUP BY t.id, t.name
        HAVING COUNT(DISTINCT tu.id_user) > 0
        ORDER BY avg_completion DESC, t.name ASC
      `);

      return result.rows.map(row => ({
        trailId: row.trail_id,
        trailName: row.trail_name,
        totalUsers: parseInt(row.total_users),
        avgCompletion: Math.round(parseFloat(row.avg_completion)),
        completionStddev: Math.round(parseFloat(row.completion_stddev)),
        minCompletion: parseInt(row.min_completion),
        maxCompletion: parseInt(row.max_completion),
        completedUsers: parseInt(row.completed_users),
        notStartedUsers: parseInt(row.not_started_users),
        completionRate: row.total_users > 0 
          ? Math.round((row.completed_users / row.total_users) * 100)
          : 0
      }));
    } catch (error) {
      console.error('Erro ao buscar média de completude das trilhas:', error);
      throw error;
    }
  }

  /**
   * Busca cards mais favoritados (C+F - Cards Mais Favoritados)
   * @param {number} limit - Número de cards a retornar (default: 5)
   * @returns {Array} Cards mais favoritados
   */
  static async getMostFavoritedCards(limit = 5) {
    try {
      const result = await db.query(`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.image,
          COUNT(cu.id_user) as favorite_count,
          ARRAY_AGG(u.name ORDER BY cu.obtained_at DESC) FILTER (WHERE "user".name IS NOT NULL) as recent_users
        FROM card c
        LEFT JOIN card_user cu ON c.id = cu.id_card
        LEFT JOIN "user" ON cu.id_user = "user".id
        GROUP BY c.id, c.title, c.description, c.image
        ORDER BY favorite_count DESC, c.title ASC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        cardId: row.id,
        title: row.title,
        description: row.description,
        image: row.image,
        favoriteCount: parseInt(row.favorite_count),
        recentUsers: row.recent_users ? row.recent_users.slice(0, 3) : []
      }));
    } catch (error) {
      console.error('Erro ao buscar cards mais favoritados:', error);
      throw error;
    }
  }

  /**
   * Busca cards menos favoritados (C-F - Cards Menos Favoritados)
   * @param {number} limit - Número de cards a retornar (default: 5)
   * @returns {Array} Cards menos favoritados
   */
  static async getLeastFavoritedCards(limit = 5) {
    try {
      const result = await db.query(`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.image,
          COUNT(cu.id_user) as favorite_count,
          c.created_at
        FROM card c
        LEFT JOIN card_user cu ON c.id = cu.id_card
        GROUP BY c.id, c.title, c.description, c.image, c.created_at
        ORDER BY favorite_count ASC, c.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        cardId: row.id,
        title: row.title,
        description: row.description,
        image: row.image,
        favoriteCount: parseInt(row.favorite_count),
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Erro ao buscar cards menos favoritados:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas gerais da plataforma para admin
   * @returns {Object} Estatísticas gerais
   */
  static async getGeneralPlatformStats() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN ru.id_role = 3 THEN "user".id END) as total_ptds,
          COUNT(DISTINCT CASE WHEN ru.id_role = 2 THEN "user".id END) as total_gestors,
          COUNT(DISTINCT CASE WHEN ru.id_role = 1 THEN "user".id END) as total_admins,
          COUNT(DISTINCT t.id) as total_trails,
          COUNT(DISTINCT m.id) as total_modules,
          COUNT(DISTINCT c.id) as total_classes,
          COUNT(DISTINCT card.id) as total_cards,
          COUNT(DISTINCT tu.id) as total_trail_enrollments,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id END) as completed_trails,
          COUNT(DISTINCT cu.id) as total_favorites,
          COALESCE(AVG(CASE WHEN ru.id_role = 3 THEN "user".score END), 0) as avg_ptd_score
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        CROSS JOIN trail t
        LEFT JOIN module m ON t.id = m.id_trail
        LEFT JOIN class c ON m.id = c.id_module
        CROSS JOIN card card
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        LEFT JOIN card_user cu ON "user".id = cu.id_user
      `);

      const stats = result.rows[0];
      return {
        totalPTDs: parseInt(stats.total_ptds),
        totalGestors: parseInt(stats.total_gestors),
        totalAdmins: parseInt(stats.total_admins),
        totalTrails: parseInt(stats.total_trails),
        totalModules: parseInt(stats.total_modules),
        totalClasses: parseInt(stats.total_classes),
        totalCards: parseInt(stats.total_cards),
        totalTrailEnrollments: parseInt(stats.total_trail_enrollments),
        completedTrails: parseInt(stats.completed_trails),
        totalFavorites: parseInt(stats.total_favorites),
        avgPTDScore: Math.round(parseFloat(stats.avg_ptd_score)),
        completionRate: stats.total_trail_enrollments > 0 
          ? Math.round((stats.completed_trails / stats.total_trail_enrollments) * 100)
          : 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas gerais da plataforma:', error);
      throw error;
    }
  }

  /**
   * Busca atividade recente na plataforma
   * @param {number} days - Número de dias para análise (default: 7)
   * @returns {Object} Estatísticas de atividade
   */
  static async getRecentActivity(days = 7) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN tu.started_at >= NOW() - INTERVAL '${days} days' THEN tu.id END) as new_enrollments,
          COUNT(DISTINCT CASE WHEN tu.completed_at >= NOW() - INTERVAL '${days} days' THEN tu.id END) as recent_completions,
          COUNT(DISTINCT CASE WHEN cu.obtained_at >= NOW() - INTERVAL '${days} days' THEN cu.id END) as new_favorites,
          COUNT(DISTINCT CASE WHEN "user".created_at >= NOW() - INTERVAL '${days} days' THEN "user".id END) as new_users
        FROM "user"
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        LEFT JOIN card_user cu ON "user".id = cu.id_user
      `);

      const activity = result.rows[0];
      return {
        period: `${days} dias`,
        newEnrollments: parseInt(activity.new_enrollments),
        recentCompletions: parseInt(activity.recent_completions),
        newFavorites: parseInt(activity.new_favorites),
        newUsers: parseInt(activity.new_users)
      };
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de engagement dos usuários
   * @returns {Object} Métricas de engagement
   */
  static async getUserEngagementStats() {
    try {
      const result = await db.query(`
        WITH user_stats AS (
          SELECT 
            "user".id,
            COUNT(DISTINCT tu.id_trail) as trails_count,
            COUNT(DISTINCT cu.id_card) as favorites_count,
            COALESCE(AVG(tu.percentage), 0) as avg_progress
          FROM "user"
          JOIN role_user ru ON "user".id = ru.id_user
          LEFT JOIN trail_user tu ON "user".id = tu.id_user
          LEFT JOIN card_user cu ON "user".id = cu.id_user
          WHERE ru.id_role = 3
          GROUP BY "user".id
        )
        SELECT 
          COUNT(*) as total_ptds,
          COUNT(CASE WHEN trails_count > 0 THEN 1 END) as active_ptds,
          COUNT(CASE WHEN trails_count > 2 THEN 1 END) as highly_active_ptds,
          COUNT(CASE WHEN favorites_count > 0 THEN 1 END) as ptds_with_favorites,
          COALESCE(AVG(trails_count), 0) as avg_trails_per_ptd,
          COALESCE(AVG(favorites_count), 0) as avg_favorites_per_ptd,
          COALESCE(AVG(avg_progress), 0) as overall_avg_progress
        FROM user_stats
      `);

      const stats = result.rows[0];
      return {
        totalPTDs: parseInt(stats.total_ptds),
        activePTDs: parseInt(stats.active_ptds),
        highlyActivePTDs: parseInt(stats.highly_active_ptds),
        ptdsWithFavorites: parseInt(stats.ptds_with_favorites),
        avgTrailsPerPTD: Math.round(parseFloat(stats.avg_trails_per_ptd)),
        avgFavoritesPerPTD: Math.round(parseFloat(stats.avg_favorites_per_ptd)),
        overallAvgProgress: Math.round(parseFloat(stats.overall_avg_progress)),
        engagementRate: stats.total_ptds > 0 
          ? Math.round((stats.active_ptds / stats.total_ptds) * 100)
          : 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de engagement:', error);
      throw error;
    }
  }

  /**
   * Busca relatório de performance por gestor
   * @returns {Array} Performance de cada gestor
   */
  static async getManagerPerformanceReport() {
    try {
      const result = await db.query(`
        SELECT 
          "user".id as gestor_id,
          "user".name as gestor_name,
          "user".email as gestor_email,
          COUNT(DISTINCT "user".id) as team_size,
          COUNT(DISTINCT ht.id_trail) as assigned_trails,
          COALESCE(AVG(u_ptd.score), 0) as team_avg_score,
          COALESCE(AVG(tu.percentage), 0) as team_avg_progress,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id END) as team_completions
        FROM "user"
        JOIN role_user ru_gestor ON "user".id = ru_gestor.id_user AND ru_gestor.id_role = 2
        LEFT JOIN hierarchy h ON ru_gestor.id = h.id_role_user1
        LEFT JOIN role_user ru_ptd ON h.id_role_user2 = ru_ptd.id AND ru_ptd.id_role = 3
        LEFT JOIN "user" ON ru_ptd.id_user = "user".id
        LEFT JOIN hierarchy_trail ht ON h.id = ht.id_hierarchy
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        GROUP BY "user".id, "user".name, "user".email
        ORDER BY team_size DESC, gestor_name ASC
      `);

      return result.rows.map(row => ({
        gestorId: row.gestor_id,
        gestorName: row.gestor_name,
        gestorEmail: row.gestor_email,
        teamSize: parseInt(row.team_size),
        assignedTrails: parseInt(row.assigned_trails),
        teamAvgScore: Math.round(parseFloat(row.team_avg_score)),
        teamAvgProgress: Math.round(parseFloat(row.team_avg_progress)),
        teamCompletions: parseInt(row.team_completions)
      }));
    } catch (error) {
      console.error('Erro ao buscar relatório de performance dos gestores:', error);
      throw error;
    }
  }

  /**
   * Busca dados para dashboard executivo
   * @returns {Object} Dados consolidados para dashboards executivos
   */
  static async getExecutiveDashboardData() {
    try {
      const [
        platformStats,
        recentActivity,
        engagementStats,
        topTrails,
        topCards
      ] = await Promise.all([
        this.getGeneralPlatformStats(),
        this.getRecentActivity(30),
        this.getUserEngagementStats(),
        this.getPTDsPerTrail(),
        this.getMostFavoritedCards(3)
      ]);

      return {
        platformStats,
        recentActivity,
        engagementStats,
        topTrails: topTrails.slice(0, 5),
        topCards,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard executivo:', error);
      throw error;
    }
  }

  /**
   * Busca dados de crescimento ao longo do tempo
   * @param {number} months - Número de meses para análise (default: 6)
   * @returns {Array} Dados de crescimento mensal
   */
  static async getGrowthMetrics(months = 6) {
    try {
      const result = await db.query(`
        WITH monthly_data AS (
          SELECT 
            DATE_TRUNC('month', generate_series(
              NOW() - INTERVAL '${months} months',
              NOW(),
              INTERVAL '1 month'
            )) as month
        ),
        user_growth AS (
          SELECT 
            DATE_TRUNC('month', "user".created_at) as month,
            COUNT(*) as new_users
          FROM "user"
          WHERE "user".created_at >= NOW() - INTERVAL '${months} months'
          GROUP BY DATE_TRUNC('month', "user".created_at)
        ),
        activity_growth AS (
          SELECT 
            DATE_TRUNC('month', tu.started_at) as month,
            COUNT(*) as new_enrollments
          FROM trail_user tu
          WHERE tu.started_at >= NOW() - INTERVAL '${months} months'
          GROUP BY DATE_TRUNC('month', tu.started_at)
        )
        SELECT 
          md.month,
          COALESCE(ug.new_users, 0) as new_users,
          COALESCE(ag.new_enrollments, 0) as new_enrollments
        FROM monthly_data md
        LEFT JOIN user_growth ug ON md.month = ug.month
        LEFT JOIN activity_growth ag ON md.month = ag.month
        ORDER BY md.month ASC
      `);

      return result.rows.map(row => ({
        month: row.month,
        newUsers: parseInt(row.new_users),
        newEnrollments: parseInt(row.new_enrollments)
      }));
    } catch (error) {
      console.error('Erro ao buscar métricas de crescimento:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsModel;