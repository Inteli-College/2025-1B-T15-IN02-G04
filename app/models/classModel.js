const db = require('../config/db');

class ClassModel {
  static async getAllClasses() {
    const result = await db.query('SELECT * FROM class');
    return result.rows;
  }

  static async getClassById(id) {
    const result = await db.query('SELECT * FROM class WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createClass(data) {
    const result = await db.query(
      'INSERT INTO class (name, description, id_module) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.description, data.id_module]
    );
    return result.rows[0];
  }

  static async updateClass(id, data) {
    const result = await db.query(
      'UPDATE class SET name = $1, description = $2 id_module = $3 WHERE id = $4 RETURNING *',
      [data.name, data.description, data.id_module, id]
    );
    return result.rows[0];
  }

  static async deleteClass(id) {
    const result = await db.query('DELETE FROM class WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = ClassModel;