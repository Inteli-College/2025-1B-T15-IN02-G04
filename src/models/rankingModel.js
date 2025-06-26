const db = require('../config/db');

class RankingModel {
  /**
   * Busca ranking geral de PTDs (RK - Ranking para PTDs)
   * @param {number} limit - Número máximo de resultados (default: 5)
   * @returns {Array} Ranking de PTDs
   */
  static async getPTDGeneralRanking(limit = 5) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".email,
          "user".score,
          "user".avatar,
          ROW_NUMBER() OVER (ORDER BY "user".score DESC, "user".name ASC) as position
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        WHERE ru.id_role = 3
        ORDER BY "user".score DESC, "user".name ASC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        userId: row.id,
        name: row.name,
        email: row.email,
        score: row.score,
        avatar: row.avatar,
        position: parseInt(row.position)
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking geral de PTDs:', error);
      throw error;
    }
  }

  /**
   * Busca posição específica de um PTD no ranking geral
   * @param {number} ptdId - ID do PTD
   * @returns {Object|null} Posição e dados do PTD
   */
  static async getPTDRankingPosition(ptdId) {
    try {
      const result = await db.query(`
        WITH ranking AS (
          SELECT 
            "user".id,
            "user".name,
            "user".score,
            ROW_NUMBER() OVER (ORDER BY "user".score DESC, "user".name ASC) as position,
            COUNT(*) OVER() as total_ptds
          FROM "user"
          JOIN role_user ru ON "user".id = ru.id_user
          WHERE ru.id_role = 3
        )
        SELECT * FROM ranking WHERE id = $1
      `, [ptdId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        userId: row.id,
        name: row.name,
        score: row.score,
        position: parseInt(row.position),
        totalPTDs: parseInt(row.total_ptds)
      };
    } catch (error) {
      console.error('Erro ao buscar posição do PTD no ranking:', error);
      throw error;
    }
  }

  /**
   * Busca ranking da equipe específica de um gestor (RKE - Ranking da Equipe)
   * @param {number} gestorId - ID do gestor
   * @returns {Array} Ranking da equipe
   */
  static async getTeamRanking(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".email,
          "user".score,
          "user".avatar,
          ROW_NUMBER() OVER (ORDER BY "user".score DESC, "user".name ASC) as position,
          COUNT(DISTINCT tu.id_trail) as active_trails,
          COALESCE(AVG(tu.percentage), 0) as avg_progress
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        JOIN "user" ON ru2.id_user = "user".id
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        WHERE ru1.id_user = $1 AND ru1.id_role = 2 AND ru2.id_role = 3
        GROUP BY "user".id, "user".name, "user".email, "user".score, "user".avatar
        ORDER BY "user".score DESC, "user".name ASC
      `, [gestorId]);

      return result.rows.map(row => ({
        userId: row.id,
        name: row.name,
        email: row.email,
        score: row.score,
        avatar: row.avatar,
        position: parseInt(row.position),
        activeTrails: parseInt(row.active_trails),
        avgProgress: Math.round(parseFloat(row.avg_progress))
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking da equipe:', error);
      throw error;
    }
  }

  /**
   * Busca ranking completo de PTDs com informações detalhadas
   * @param {number} page - Página (opcional, para paginação)
   * @param {number} limit - Limite por página
   * @returns {Object} Ranking paginado
   */
  static async getCompletePTDRanking(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".email,
          "user".score,
          "user".avatar,
          "user".created_at as joined_at,
          ROW_NUMBER() OVER (ORDER BY "user".score DESC, "user".name ASC) as position,
          COUNT(DISTINCT tu.id_trail) as active_trails,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_trail END) as completed_trails,
          COALESCE(AVG(tu.percentage), 0) as avg_progress,
          COUNT(*) OVER() as total_count
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        WHERE ru.id_role = 3
        GROUP BY "user".id, "user".name, "user".email, "user".score, "user".avatar, "user".created_at
        ORDER BY "user".score DESC, "user".name ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: result.rows.map(row => ({
          userId: row.id,
          name: row.name,
          email: row.email,
          score: row.score,
          avatar: row.avatar,
          joinedAt: row.joined_at,
          position: parseInt(row.position),
          activeTrails: parseInt(row.active_trails),
          completedTrails: parseInt(row.completed_trails),
          avgProgress: Math.round(parseFloat(row.avg_progress))
        })),
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Erro ao buscar ranking completo de PTDs:', error);
      throw error;
    }
  }

  /**
   * Busca ranking de PTDs por progresso em trilhas específicas
   * @param {number} trailId - ID da trilha
   * @param {number} limit - Limite de resultados
   * @returns {Array} Ranking por progresso na trilha
   */
  static async getPTDRankingByTrail(trailId, limit = 10) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".score,
          tu.percentage as trail_progress,
          tu.started_at,
          tu.completed_at,
          ROW_NUMBER() OVER (ORDER BY tu.percentage DESC, tu.completed_at ASC NULLS LAST, "user".score DESC) as position,
          t.name as trail_name
        FROM trail_user tu
        JOIN "user" ON tu.id_user = "user".id
        JOIN role_user ru ON "user".id = ru.id_user
        JOIN trail t ON tu.id_trail = t.id
        WHERE ru.id_role = 3 AND tu.id_trail = $1 AND tu.percentage > 0
        ORDER BY tu.percentage DESC, tu.completed_at ASC NULLS LAST, "user".score DESC
        LIMIT $2
      `, [trailId, limit]);

      return result.rows.map(row => ({
        userId: row.id,
        name: row.name,
        score: row.score,
        trailProgress: row.trail_progress,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        position: parseInt(row.position),
        trailName: row.trail_name
      }));
    } catch (error) {
      console.error('Erro ao buscar ranking por trilha:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de ranking (para dashboards)
   * @returns {Object} Estatísticas gerais de ranking
   */
  static async getRankingStatistics() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN ru.id_role = 3 THEN "user".id END) as total_ptds,
          COUNT(DISTINCT CASE WHEN ru.id_role = 2 THEN "user".id END) as total_gestors,
          COUNT(DISTINCT CASE WHEN ru.id_role = 1 THEN "user".id END) as total_admins,
          COALESCE(MAX(CASE WHEN ru.id_role = 3 THEN "user".score END), 0) as highest_ptd_score,
          COALESCE(AVG(CASE WHEN ru.id_role = 3 THEN "user".score END), 0) as avg_ptd_score,
          COALESCE(MIN(CASE WHEN ru.id_role = 3 THEN "user".score END), 0) as lowest_ptd_score
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
      `);

      const stats = result.rows[0];
      return {
        totalPTDs: parseInt(stats.total_ptds),
        totalGestors: parseInt(stats.total_gestors),
        totalAdmins: parseInt(stats.total_admins),
        highestPTDScore: parseInt(stats.highest_ptd_score),
        avgPTDScore: Math.round(parseFloat(stats.avg_ptd_score)),
        lowestPTDScore: parseInt(stats.lowest_ptd_score)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de ranking:', error);
      throw error;
    }
  }

  /**
   * Busca evolução do score de um PTD ao longo do tempo
   * @param {number} ptdId - ID do PTD
   * @param {number} days - Número de dias para análise (default: 30)
   * @returns {Array} Evolução do score
   */
  static async getPTDScoreEvolution(ptdId, days = 30) {
    try {
      // Por enquanto retorna apenas o score atual, pois não temos histórico
      // Esta função pode ser expandida quando implementarmos log de scores
      const result = await db.query(`
        SELECT 
          "user".score,
          "user".updated_at,
          COUNT(DISTINCT tu.id_trail) as active_trails,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_trail END) as completed_trails
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        WHERE "user".id = $1 AND ru.id_role = 3
        GROUP BY "user".id, "user".score, "user".updated_at
      `, [ptdId]);

      if (result.rows.length === 0) {
        return [];
      }

      const data = result.rows[0];
      return [{
        date: data.updated_at,
        score: data.score,
        activeTrails: parseInt(data.active_trails),
        completedTrails: parseInt(data.completed_trails)
      }];
    } catch (error) {
      console.error('Erro ao buscar evolução do score:', error);
      throw error;
    }
  }

  /**
   * Compara performance entre PTDs da mesma equipe
   * @param {number} gestorId - ID do gestor
   * @returns {Array} Comparativo da equipe
   */
  static async getTeamPerformanceComparison(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id,
          "user".name,
          "user".score,
          COUNT(DISTINCT tu.id_trail) as active_trails,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_trail END) as completed_trails,
          COALESCE(AVG(tu.percentage), 0) as avg_progress,
          COUNT(DISTINCT cu.id_card) as favorite_cards,
          MAX(tu.completed_at) as last_completion
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        JOIN "user" ON ru2.id_user = "user".id
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        LEFT JOIN card_user cu ON "user".id = cu.id_user
        WHERE ru1.id_user = $1 AND ru1.id_role = 2 AND ru2.id_role = 3
        GROUP BY "user".id, "user".name, "user".score
        ORDER BY "user".score DESC, "user".name ASC
      `, [gestorId]);

      return result.rows.map(row => ({
        userId: row.id,
        name: row.name,
        score: row.score,
        activeTrails: parseInt(row.active_trails),
        completedTrails: parseInt(row.completed_trails),
        avgProgress: Math.round(parseFloat(row.avg_progress)),
        favoriteCards: parseInt(row.favorite_cards),
        lastCompletion: row.last_completion
      }));
    } catch (error) {
      console.error('Erro ao buscar comparativo da equipe:', error);
      throw error;
    }
  }

  /**
   * Atualiza score de um usuário (função auxiliar)
   * @param {number} userId - ID do usuário
   * @param {number} newScore - Novo score
   * @returns {Object} Usuário atualizado
   */
  static async updateUserScore(userId, newScore) {
    try {
      const result = await db.query(`
        UPDATE "user" 
        SET score = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, score
      `, [userId, newScore]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar score do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuários próximos no ranking (para mostrar contexto)
   * @param {number} userId - ID do usuário
   * @param {number} range - Quantos usuários antes e depois mostrar (default: 2)
   * @returns {Array} Usuários próximos no ranking
   */
  static async getNearbyRankingUsers(userId, range = 2) {
    try {
      const result = await db.query(`
        WITH user_ranking AS (
          SELECT 
            "user".id,
            "user".name,
            "user".score,
            ROW_NUMBER() OVER (ORDER BY "user".score DESC, "user".name ASC) as position
          FROM "user"
          JOIN role_user ru ON "user".id = ru.id_user
          WHERE ru.id_role = 3
        ),
        target_user AS (
          SELECT position FROM user_ranking WHERE id = $1
        )
        SELECT ur.* 
        FROM user_ranking ur, target_user tu
        WHERE ur.position BETWEEN (tu.position - $2) AND (tu.position + $2)
        ORDER BY ur.position ASC
      `, [userId, range]);

      return result.rows.map(row => ({
        userId: row.id,
        name: row.name,
        score: row.score,
        position: parseInt(row.position),
        isCurrentUser: row.id === userId
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários próximos no ranking:', error);
      throw error;
    }
  }
}

module.exports = RankingModel;