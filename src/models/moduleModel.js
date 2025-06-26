const db = require('../config/db');

class ModuleModel {
  static async getAllModules() {
    try {
      const result = await db.query('SELECT * FROM module ORDER BY trail_id, order_position');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      throw error;
    }
  }

  static async getModuleById(id) {
    try {
      const result = await db.query('SELECT * FROM module WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar módulo:', error);
      throw error;
    }
  }

  // 🔧 CORRIGIDO: Campos corretos do banco
  static async getModulesByTrailId(trailId) {
    try {
      const result = await db.query(
        'SELECT * FROM module WHERE id_trail = $1 ORDER BY module_order', 
        [trailId]
      );
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar módulos da trilha:', error);
      throw error;
    }
  }

  static async getModuleByName(name) {
    try {
      const result = await db.query('SELECT * FROM module WHERE name = $1', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar módulo por nome:', error);
      throw error;
    }
  }

  static async createModule(data) {
    try {
      const result = await db.query(
        'INSERT INTO module (name, description, duration, trail_id, order_position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [data.name, data.description, data.duration, data.trail_id, data.order_position]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw error;
    }
  }

  static async updateModule(id, name, description, duration, order_position) {
    try {
      const result = await db.query(
        'UPDATE module SET name = $1, description = $2, duration = $3, order_position = $4 WHERE id = $5 RETURNING *',
        [name, description, duration, order_position, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
      throw error;
    }
  }

  static async deleteModule(id) {
    try {
      const result = await db.query('DELETE FROM module WHERE id = $1 RETURNING *', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao deletar módulo:', error);
      throw error;
    }
  }

  static async getModulesWithTrailInfo() {
    try {
      const result = await db.query(`
        SELECT 
          m.*,
          t.name as trail_name,
          t.description as trail_description
        FROM module m
        LEFT JOIN trail t ON m.trail_id = t.id
        ORDER BY m.trail_id, m.order_position
      `);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar módulos com informações da trilha:', error);
      throw error;
    }
  }
}

module.exports = ModuleModel;