const db = require('../config/db');

class MeritModel {
  static async getAllMerits() {
    const result = await db.query('SELECT * FROM merit');
    return result.rows;
  }

  static async getMeritById(id) {
    const result = await db.query('SELECT * FROM merit WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createMerit(data) {
    const result = await db.query(
      'INSERT INTO merit (name, description) VALUES ($1, $2) RETURNING *',
      [data.name, data.description]
    );
    return result.rows[0];
  }

  static async updateMerit(id, name, description) {
    const result = await db.query( 'UPDATE merit SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
    );
    return result.rows[0];
  }

  static async deleteMerit(id) {
    const result = await db.query('DELETE FROM merit WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = MeritModel;