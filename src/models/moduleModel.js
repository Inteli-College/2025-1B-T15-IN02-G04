const db = require('../config/db');

class ModuleModel {
  static async getAllModules() {
    try {
      const result = await db.query('SELECT * FROM module');
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

  static async getModuleByName(name) {
    try {
      const result = await db.query('SELECT * FROM module WHERE name = $1', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar módulo:', error);
      throw error;
    }
  }

  static async createModule(data) {
    try {
      const result = await db.query(
        'INSERT INTO module (name, description, id_trail) VALUES ($1, $2, $3) RETURNING *',
        [data.name, data.description, data.id_trail]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw error;
    }
  }

  static async updateModule(id, name, description, id_trail) {
    try {
      const result = await db.query(
        'UPDATE module SET name = $1, description = $2, id_trail = $3 WHERE id = $4 RETURNING *',
        [name, description, id_trail, id]
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
}

module.exports = ModuleModel;