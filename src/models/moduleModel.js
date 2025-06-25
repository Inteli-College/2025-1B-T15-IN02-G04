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
        'INSERT INTO module (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
      throw error;
    }
  }

  static async updateModule(id, name, description) {
    try {
      const result = await db.query(
        'UPDATE module SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
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