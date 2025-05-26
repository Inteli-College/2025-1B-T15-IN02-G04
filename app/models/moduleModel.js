const db = require('../config/db');

class ModuleModel {
  static async getAllModules() {
    const result = await db.query('SELECT * FROM module');
    return result.rows;
  }

  static async getModuleById(id) {
    const result = await db.query('SELECT * FROM module WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createModule(data) {
    const result = await db.query(
      'INSERT INTO module (name, description, id_trail) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.description, data.id_trail]
    );
    return result.rows[0];
  }

  static async updateModule(id, data) {
    const result = await db.query(
      'UPDATE module SET name = $1, description = $2 id_trail = $3 WHERE id = $4 RETURNING *',
      [data.name, data.description, data.id_trail, id]
    );
    return result.rows[0];
  }

  static async deleteModule(id) {
    const result = await db.query('DELETE FROM module WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = ModuleModel;