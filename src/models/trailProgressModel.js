const db = require('../config/db');

class TrailProgressModel {
  /**
   * Busca todas as trilhas que o usuário está fazendo (TF - Trilhas sendo Feitas)
   * @param {number} userId - ID do usuário
   * @returns {Array} Lista de trilhas com progresso
   */
  static async getUserActiveTrails(userId) {
    try {
      const result = await db.query(`
        SELECT 
          t.id,
          t.name,
          t.description,
          tu.percentage,
          tu.started_at,
          tu.completed_at,
          CASE 
            WHEN tu.percentage = 100 THEN 'completed'
            WHEN tu.percentage > 0 THEN 'in_progress'
            ELSE 'not_started'
          END as status
        FROM trail_user tu
        JOIN trail t ON tu.id_trail = t.id
        WHERE tu.id_user = $1
        ORDER BY tu.started_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar trilhas ativas do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca trilhas atribuídas pelo gestor (TA - Trilhas Atribuídas)
   * @param {number} userId - ID do PTD
   * @returns {Array} Lista de trilhas atribuídas
   */
  static async getAssignedTrails(userId) {
    try {
      const result = await db.query(`
        SELECT DISTINCT
          t.id,
          t.name,
          t.description,
          COALESCE(tu.percentage, 0) as percentage,
          tu.started_at,
          ht.permissions,
          u_gestor.name as assigned_by_name,
          h.created_at as assigned_at
        FROM hierarchy_trail ht
        JOIN hierarchy h ON ht.id_hierarchy = h.id
        JOIN role_user ru_ptd ON h.id_role_user2 = ru_ptd.id
        JOIN role_user ru_gestor ON h.id_role_user1 = ru_gestor.id
        JOIN "user" u_gestor ON ru_gestor.id_user = u_gestor.id
        JOIN trail t ON ht.id_trail = t.id
        LEFT JOIN trail_user tu ON t.id = tu.id_trail AND tu.id_user = $1
        WHERE ru_ptd.id_user = $1 AND ru_ptd.id_role = 3 AND ru_gestor.id_role = 2
        ORDER BY h.created_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar trilhas atribuídas:', error);
      throw error;
    }
  }

  /**
   * Calcula progresso detalhado de uma trilha específica
   * @param {number} userId - ID do usuário
   * @param {number} trailId - ID da trilha
   * @returns {Object} Progresso detalhado da trilha
   */
  static async getTrailDetailedProgress(userId, trailId) {
    try {
      const result = await db.query(`
        SELECT 
          t.id as trail_id,
          t.name as trail_name,
          t.description as trail_description,
          COUNT(DISTINCT m.id) as total_modules,
          COUNT(DISTINCT c.id) as total_classes,
          COUNT(DISTINCT CASE WHEN cu.complete = TRUE THEN c.id END) as completed_classes,
          COUNT(DISTINCT CASE WHEN mu.percentage = 100 THEN m.id END) as completed_modules,
          COALESCE(tu.percentage, 0) as trail_percentage,
          tu.started_at,
          tu.completed_at
        FROM trail t
        LEFT JOIN module m ON t.id = m.id_trail
        LEFT JOIN class c ON m.id = c.id_module
        LEFT JOIN class_user cu ON c.id = cu.id_class AND cu.id_user = $1
        LEFT JOIN module_user mu ON m.id = mu.id_module AND mu.id_user = $1
        LEFT JOIN trail_user tu ON t.id = tu.id_trail AND tu.id_user = $1
        WHERE t.id = $2
        GROUP BY t.id, t.name, t.description, tu.percentage, tu.started_at, tu.completed_at
      `, [userId, trailId]);

      if (result.rows.length === 0) {
        return null;
      }

      const data = result.rows[0];
      
      // Calcular progresso real baseado nas aulas completadas
      const realProgress = data.total_classes > 0 
        ? Math.round((data.completed_classes / data.total_classes) * 100)
        : 0;

      return {
        trailId: data.trail_id,
        trailName: data.trail_name,
        description: data.trail_description,
        totalModules: parseInt(data.total_modules),
        totalClasses: parseInt(data.total_classes),
        completedClasses: parseInt(data.completed_classes),
        completedModules: parseInt(data.completed_modules),
        trailPercentage: parseInt(data.trail_percentage),
        realProgress: realProgress,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        status: realProgress === 100 ? 'completed' : realProgress > 0 ? 'in_progress' : 'not_started'
      };
    } catch (error) {
      console.error('Erro ao buscar progresso detalhado da trilha:', error);
      throw error;
    }
  }

  /**
   * Busca módulos de uma trilha com progresso
   * @param {number} userId - ID do usuário
   * @param {number} trailId - ID da trilha
   * @returns {Array} Lista de módulos com progresso
   */
  static async getTrailModulesProgress(userId, trailId) {
    try {
      const result = await db.query(`
        SELECT 
          m.id,
          m.name,
          m.description,
          m.module_order,
          COUNT(c.id) as total_classes,
          COUNT(CASE WHEN cu.complete = TRUE THEN c.id END) as completed_classes,
          COALESCE(mu.percentage, 0) as module_percentage,
          mu.started_at,
          mu.completed_at
        FROM module m
        LEFT JOIN class c ON m.id = c.id_module
        LEFT JOIN class_user cu ON c.id = cu.id_class AND cu.id_user = $1
        LEFT JOIN module_user mu ON m.id = mu.id_module AND mu.id_user = $1
        WHERE m.id_trail = $2
        GROUP BY m.id, m.name, m.description, m.module_order, mu.percentage, mu.started_at, mu.completed_at
        ORDER BY m.module_order ASC
      `, [userId, trailId]);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        moduleOrder: row.module_order,
        totalClasses: parseInt(row.total_classes),
        completedClasses: parseInt(row.completed_classes),
        percentage: parseInt(row.module_percentage),
        realProgress: row.total_classes > 0 
          ? Math.round((row.completed_classes / row.total_classes) * 100)
          : 0,
        startedAt: row.started_at,
        completedAt: row.completed_at
      }));
    } catch (error) {
      console.error('Erro ao buscar progresso dos módulos:', error);
      throw error;
    }
  }

  /**
   * Inicia uma trilha para o usuário
   * @param {number} userId - ID do usuário
   * @param {number} trailId - ID da trilha
   * @returns {Object} Registro criado
   */
  static async startTrail(userId, trailId) {
    try {
      const result = await db.query(`
        INSERT INTO trail_user (id_user, id_trail, percentage, started_at)
        VALUES ($1, $2, 0, CURRENT_TIMESTAMP)
        ON CONFLICT (id_user, id_trail) 
        DO UPDATE SET started_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, trailId]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao iniciar trilha:', error);
      throw error;
    }
  }

  /**
   * Atualiza progresso de uma trilha
   * @param {number} userId - ID do usuário
   * @param {number} trailId - ID da trilha
   * @returns {Object} Progresso atualizado
   */
  static async updateTrailProgress(userId, trailId) {
    try {
      // Primeiro calcular o progresso real
      const progressData = await this.getTrailDetailedProgress(userId, trailId);
      
      if (!progressData) {
        throw new Error('Trilha não encontrada');
      }

      const newPercentage = progressData.realProgress;
      const isCompleted = newPercentage === 100;

      // Atualizar na tabela trail_user
      const result = await db.query(`
        UPDATE trail_user 
        SET 
          percentage = $3,
          completed_at = CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_user = $1 AND id_trail = $2
        RETURNING *
      `, [userId, trailId, newPercentage, isCompleted]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar progresso da trilha:', error);
      throw error;
    }
  }

  /**
   * Marca uma aula como concluída
   * @param {number} userId - ID do usuário
   * @param {number} classId - ID da aula
   * @returns {Object} Registro atualizado
   */
  static async completeClass(userId, classId) {
    try {
      const result = await db.query(`
        INSERT INTO class_user (id_user, id_class, complete, started_at, completed_at)
        VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id_user, id_class)
        DO UPDATE SET 
          complete = TRUE,
          completed_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, classId]);

      // Buscar ID da trilha para atualizar progresso
      const trailResult = await db.query(`
        SELECT m.id_trail
        FROM class c
        JOIN module m ON c.id_module = m.id
        WHERE c.id = $1
      `, [classId]);

      if (trailResult.rows.length > 0) {
        const trailId = trailResult.rows[0].id_trail;
        
        // Atualizar progresso da trilha
        await this.updateTrailProgress(userId, trailId);
        
        // Atualizar progresso do módulo
        await this.updateModuleProgress(userId, classId);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      throw error;
    }
  }

  /**
   * Atualiza progresso de um módulo baseado nas aulas concluídas
   * @param {number} userId - ID do usuário
   * @param {number} classId - ID da aula (para encontrar o módulo)
   */
  static async updateModuleProgress(userId, classId) {
    try {
      // Buscar ID do módulo
      const moduleResult = await db.query(`
        SELECT c.id_module
        FROM class c
        WHERE c.id = $1
      `, [classId]);

      if (moduleResult.rows.length === 0) {
        return;
      }

      const moduleId = moduleResult.rows[0].id_module;

      // Calcular progresso do módulo
      const progressResult = await db.query(`
        SELECT 
          COUNT(c.id) as total_classes,
          COUNT(CASE WHEN cu.complete = TRUE THEN c.id END) as completed_classes
        FROM class c
        LEFT JOIN class_user cu ON c.id = cu.id_class AND cu.id_user = $1
        WHERE c.id_module = $2
      `, [userId, moduleId]);

      const { total_classes, completed_classes } = progressResult.rows[0];
      const percentage = total_classes > 0 
        ? Math.round((completed_classes / total_classes) * 100)
        : 0;

      const isCompleted = percentage === 100;

      // Atualizar ou inserir progresso do módulo
      await db.query(`
        INSERT INTO module_user (id_user, id_module, percentage, started_at, completed_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE NULL END)
        ON CONFLICT (id_user, id_module)
        DO UPDATE SET 
          percentage = $3,
          completed_at = CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE module_user.completed_at END
      `, [userId, moduleId, percentage, isCompleted]);

    } catch (error) {
      console.error('Erro ao atualizar progresso do módulo:', error);
      throw error;
    }
  }

  /**
   * Busca progresso de múltiplos PTDs em uma trilha (para gestores)
   * @param {Array} userIds - Array de IDs dos PTDs
   * @param {number} trailId - ID da trilha
   * @returns {Array} Progresso de cada PTD na trilha
   */
  static async getMultipleUsersTrailProgress(userIds, trailId) {
    try {
      if (!userIds || userIds.length === 0) {
        return [];
      }

      const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
      
      const result = await db.query(`
        SELECT 
          "user".id as user_id,
          "user".name as user_name,
          t.id as trail_id,
          t.name as trail_name,
          COALESCE(tu.percentage, 0) as percentage,
          tu.started_at,
          tu.completed_at,
          CASE 
            WHEN tu.percentage = 100 THEN 'completed'
            WHEN tu.percentage > 0 THEN 'in_progress'
            ELSE 'not_started'
          END as status
        FROM "user"
        CROSS JOIN trail t
        LEFT JOIN trail_user tu ON u.id = tu.id_user AND t.id = tu.id_trail
        WHERE "user".id IN (${placeholders}) AND t.id = $${userIds.length + 1}
        ORDER BY "user".name ASC
      `, [...userIds, trailId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar progresso de múltiplos usuários:', error);
      throw error;
    }
  }

  /**
   * Busca todas as trilhas com progresso de um usuário específico (para gestores)
   * @param {number} ptdId - ID do PTD
   * @returns {Array} Todas as trilhas com progresso
   */
  static async getPTDAllTrailsProgress(ptdId) {
    try {
      const result = await db.query(`
        SELECT 
          t.id as trail_id,
          t.name as trail_name,
          t.description,
          COALESCE(tu.percentage, 0) as percentage,
          tu.started_at,
          tu.completed_at,
          CASE 
            WHEN tu.percentage = 100 THEN 'completed'
            WHEN tu.percentage > 0 THEN 'in_progress'
            ELSE 'not_started'
          END as status
        FROM trail t
        LEFT JOIN trail_user tu ON t.id = tu.id_trail AND tu.id_user = $1
        ORDER BY 
          CASE WHEN tu.percentage IS NOT NULL THEN 0 ELSE 1 END,
          tu.started_at DESC,
          t.name ASC
      `, [ptdId]);

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar progresso completo do PTD:', error);
      throw error;
    }
  }
}

module.exports = TrailProgressModel;