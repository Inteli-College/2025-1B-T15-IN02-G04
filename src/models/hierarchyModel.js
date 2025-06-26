const db = require('../config/db');

class HierarchyModel {
  /**
   * Busca todos os PTDs da equipe de um gestor (PE - PTDs na Equipe)
   * @param {number} gestorId - ID do gestor
   * @returns {Array} Lista de PTDs da equipe
   */
  static async getTeamMembers(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id as ptd_id,
          "user".name as ptd_name,
          "user".email as ptd_email,
          "user".score as ptd_score,
          "user".avatar,
          ru_ptd.id as role_user_id,
          h.created_at as added_to_team_at,
          COUNT(DISTINCT tu.id_trail) as active_trails,
          COALESCE(AVG(tu.percentage), 0) as avg_progress
        FROM hierarchy h
        JOIN role_user ru_gestor ON h.id_role_user1 = ru_gestor.id
        JOIN role_user ru_ptd ON h.id_role_user2 = ru_ptd.id
        JOIN "user" ON ru_ptd.id_user = "user".id
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        WHERE ru_gestor.id_user = $1 
        AND ru_gestor.id_role = 2 
        AND ru_ptd.id_role = 3
        GROUP BY "user".id, "user".name, "user".email, "user".score, "user".avatar, ru_ptd.id, h.created_at
        ORDER BY "user".name ASC
      `, [gestorId]);

      return result.rows.map(row => ({
        ptdId: row.ptd_id,
        ptdName: row.ptd_name,
        ptdEmail: row.ptd_email,
        ptdScore: row.ptd_score,
        avatar: row.avatar,
        roleUserId: row.role_user_id,
        addedToTeamAt: row.added_to_team_at,
        activeTrails: parseInt(row.active_trails),
        avgProgress: Math.round(parseFloat(row.avg_progress))
      }));
    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      throw error;
    }
  }

  /**
   * Busca PTDs disponíveis para adicionar à equipe (que não estão na equipe atual)
   * @param {number} gestorId - ID do gestor
   * @returns {Array} Lista de PTDs disponíveis
   */
  static async getAvailablePTDs(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id as ptd_id,
          "user".name as ptd_name,
          "user".email as ptd_email,
          "user".score as ptd_score,
          "user".avatar
        FROM "user"
        JOIN role_user ru ON "user".id = ru.id_user
        WHERE ru.id_role = 3
        AND ru.id NOT IN (
          SELECT h.id_role_user2
          FROM hierarchy h
          JOIN role_user ru_gestor ON h.id_role_user1 = ru_gestor.id
          WHERE ru_gestor.id_user = $1 AND ru_gestor.id_role = 2
        )
        ORDER BY "user".name ASC
      `, [gestorId]);

      return result.rows.map(row => ({
        ptdId: row.ptd_id,
        ptdName: row.ptd_name,
        ptdEmail: row.ptd_email,
        ptdScore: row.ptd_score,
        avatar: row.avatar
      }));
    } catch (error) {
      console.error('Erro ao buscar PTDs disponíveis:', error);
      throw error;
    }
  }

  /**
   * Adiciona um PTD à equipe do gestor
   * @param {number} gestorId - ID do gestor
   * @param {number} ptdId - ID do PTD
   * @returns {Object} Relacionamento criado
   */
  static async addPTDToTeam(gestorId, ptdId) {
    try {
      // Buscar role_user IDs
      const gestorRoleResult = await db.query(`
        SELECT id FROM role_user WHERE id_user = $1 AND id_role = 2
      `, [gestorId]);

      const ptdRoleResult = await db.query(`
        SELECT id FROM role_user WHERE id_user = $1 AND id_role = 3
      `, [ptdId]);

      if (gestorRoleResult.rows.length === 0) {
        throw new Error('Gestor não encontrado');
      }

      if (ptdRoleResult.rows.length === 0) {
        throw new Error('PTD não encontrado');
      }

      const gestorRoleUserId = gestorRoleResult.rows[0].id;
      const ptdRoleUserId = ptdRoleResult.rows[0].id;

      // Verificar se já existe o relacionamento
      const existingResult = await db.query(`
        SELECT id FROM hierarchy 
        WHERE id_role_user1 = $1 AND id_role_user2 = $2
      `, [gestorRoleUserId, ptdRoleUserId]);

      if (existingResult.rows.length > 0) {
        throw new Error('PTD já está na equipe');
      }

      // Criar relacionamento
      const result = await db.query(`
        INSERT INTO hierarchy (id_role_user1, id_role_user2, hierarchy_type, created_at)
        VALUES ($1, $2, 'mentor', CURRENT_TIMESTAMP)
        RETURNING *
      `, [gestorRoleUserId, ptdRoleUserId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao adicionar PTD à equipe:', error);
      throw error;
    }
  }

  /**
   * Remove um PTD da equipe do gestor
   * @param {number} gestorId - ID do gestor
   * @param {number} ptdId - ID do PTD
   * @returns {boolean} Sucesso da operação
   */
  static async removePTDFromTeam(gestorId, ptdId) {
    try {
      const result = await db.query(`
        DELETE FROM hierarchy h
        USING role_user ru1, role_user ru2
        WHERE h.id_role_user1 = ru1.id 
        AND h.id_role_user2 = ru2.id
        AND ru1.id_user = $1 AND ru1.id_role = 2
        AND ru2.id_user = $2 AND ru2.id_role = 3
        RETURNING h.id
      `, [gestorId, ptdId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao remover PTD da equipe:', error);
      throw error;
    }
  }

  /**
   * Atribui uma trilha a um PTD da equipe (ATTR - Atribuir Trilha)
   * @param {number} gestorId - ID do gestor
   * @param {number} ptdId - ID do PTD
   * @param {number} trailId - ID da trilha
   * @param {string} permissions - Permissões específicas (opcional)
   * @returns {Object} Atribuição criada
   */
  static async assignTrailToPTD(gestorId, ptdId, trailId, permissions = null) {
    try {
      // Verificar se o PTD está na equipe do gestor
      const hierarchyResult = await db.query(`
        SELECT h.id
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        WHERE ru1.id_user = $1 AND ru1.id_role = 2
        AND ru2.id_user = $2 AND ru2.id_role = 3
      `, [gestorId, ptdId]);

      if (hierarchyResult.rows.length === 0) {
        throw new Error('PTD não está na equipe do gestor');
      }

      const hierarchyId = hierarchyResult.rows[0].id;

      // Verificar se a trilha já foi atribuída
      const existingResult = await db.query(`
        SELECT id FROM hierarchy_trail
        WHERE id_hierarchy = $1 AND id_trail = $2
      `, [hierarchyId, trailId]);

      if (existingResult.rows.length > 0) {
        throw new Error('Trilha já foi atribuída a este PTD');
      }

      // Criar atribuição
      const result = await db.query(`
        INSERT INTO hierarchy_trail (id_hierarchy, id_trail, permissions)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [hierarchyId, trailId, permissions]);

      // Automaticamente iniciar a trilha para o PTD se não estiver iniciada
      await db.query(`
        INSERT INTO trail_user (id_user, id_trail, percentage, started_at)
        VALUES ($1, $2, 0, CURRENT_TIMESTAMP)
        ON CONFLICT (id_user, id_trail) DO NOTHING
      `, [ptdId, trailId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atribuir trilha ao PTD:', error);
      throw error;
    }
  }

  /**
   * Remove atribuição de trilha de um PTD
   * @param {number} gestorId - ID do gestor
   * @param {number} ptdId - ID do PTD
   * @param {number} trailId - ID da trilha
   * @returns {boolean} Sucesso da operação
   */
  static async removeTrailAssignment(gestorId, ptdId, trailId) {
    try {
      const result = await db.query(`
        DELETE FROM hierarchy_trail ht
        USING hierarchy h, role_user ru1, role_user ru2
        WHERE ht.id_hierarchy = h.id
        AND h.id_role_user1 = ru1.id
        AND h.id_role_user2 = ru2.id
        AND ru1.id_user = $1 AND ru1.id_role = 2
        AND ru2.id_user = $2 AND ru2.id_role = 3
        AND ht.id_trail = $3
        RETURNING ht.id
      `, [gestorId, ptdId, trailId]);

      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao remover atribuição de trilha:', error);
      throw error;
    }
  }

  /**
   * Busca todas as trilhas disponíveis para atribuição
   * @returns {Array} Lista de trilhas
   */
  static async getAvailableTrailsForAssignment() {
    try {
      const result = await db.query(`
        SELECT 
          t.id,
          t.name,
          t.description,
          COUNT(DISTINCT m.id) as total_modules,
          COUNT(DISTINCT c.id) as total_classes
        FROM trail t
        LEFT JOIN module m ON t.id = m.id_trail
        LEFT JOIN class c ON m.id = c.id_module
        GROUP BY t.id, t.name, t.description
        ORDER BY t.name ASC
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        totalModules: parseInt(row.total_modules),
        totalClasses: parseInt(row.total_classes)
      }));
    } catch (error) {
      console.error('Erro ao buscar trilhas disponíveis:', error);
      throw error;
    }
  }

  /**
   * Busca trilhas atribuídas por um gestor específico
   * @param {number} gestorId - ID do gestor
   * @returns {Array} Lista de atribuições
   */
  static async getTrailAssignmentsByGestor(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          t.id as trail_id,
          t.name as trail_name,
          "user".id as ptd_id,
          "user".name as ptd_name,
          ht.permissions,
          h.created_at as assigned_at,
          COALESCE(tu.percentage, 0) as progress
        FROM hierarchy_trail ht
        JOIN hierarchy h ON ht.id_hierarchy = h.id
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        JOIN "user" ON ru2.id_user = "user".id
        JOIN trail t ON ht.id_trail = t.id
        LEFT JOIN trail_user tu ON t.id = tu.id_trail AND "user".id = tu.id_user
        WHERE ru1.id_user = $1 AND ru1.id_role = 2 AND ru2.id_role = 3
        ORDER BY h.created_at DESC, t.name ASC
      `, [gestorId]);

      return result.rows.map(row => ({
        trailId: row.trail_id,
        trailName: row.trail_name,
        ptdId: row.ptd_id,
        ptdName: row.ptd_name,
        permissions: row.permissions,
        assignedAt: row.assigned_at,
        progress: parseInt(row.progress)
      }));
    } catch (error) {
      console.error('Erro ao buscar atribuições do gestor:', error);
      throw error;
    }
  }

  /**
   * Verifica se um gestor pode gerenciar um PTD específico
   * @param {number} gestorId - ID do gestor
   * @param {number} ptdId - ID do PTD
   * @returns {boolean} Se pode gerenciar
   */
  static async canManagePTD(gestorId, ptdId) {
    try {
      const result = await db.query(`
        SELECT COUNT(*) as count
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        WHERE ru1.id_user = $1 AND ru1.id_role = 2
        AND ru2.id_user = $2 AND ru2.id_role = 3
      `, [gestorId, ptdId]);

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Erro ao verificar permissão de gestão:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas da equipe para o gestor
   * @param {number} gestorId - ID do gestor
   * @returns {Object} Estatísticas da equipe
   */
  static async getTeamStatistics(gestorId) {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT ru2.id_user) as team_size,
          COUNT(DISTINCT ht.id_trail) as assigned_trails,
          COALESCE(AVG("user".score), 0) as avg_score,
          COALESCE(AVG(tu.percentage), 0) as avg_progress,
          COUNT(DISTINCT CASE WHEN tu.percentage = 100 THEN tu.id_trail END) as completed_trails
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        JOIN "user" ON ru2.id_user = "user".id
        LEFT JOIN hierarchy_trail ht ON h.id = ht.id_hierarchy
        LEFT JOIN trail_user tu ON "user".id = tu.id_user
        WHERE ru1.id_user = $1 AND ru1.id_role = 2 AND ru2.id_role = 3
      `, [gestorId]);

      const stats = result.rows[0];
      return {
        teamSize: parseInt(stats.team_size),
        assignedTrails: parseInt(stats.assigned_trails),
        avgScore: Math.round(parseFloat(stats.avg_score)),
        avgProgress: Math.round(parseFloat(stats.avg_progress)),
        completedTrails: parseInt(stats.completed_trails)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas da equipe:', error);
      throw error;
    }
  }

  /**
   * Busca gestor responsável por um PTD
   * @param {number} ptdId - ID do PTD
   * @returns {Object|null} Dados do gestor ou null se não tiver
   */
  static async getPTDManager(ptdId) {
    try {
      const result = await db.query(`
        SELECT 
          "user".id as gestor_id,
          "user".name as gestor_name,
          "user".email as gestor_email,
          h.created_at as managed_since
        FROM hierarchy h
        JOIN role_user ru1 ON h.id_role_user1 = ru1.id
        JOIN role_user ru2 ON h.id_role_user2 = ru2.id
        JOIN "user" ON ru1.id_user = "user".id
        WHERE ru2.id_user = $1 AND ru2.id_role = 3 AND ru1.id_role = 2
        LIMIT 1
      `, [ptdId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar gestor do PTD:', error);
      throw error;
    }
  }
}

module.exports = HierarchyModel;