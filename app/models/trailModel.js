const db = require('../config/db');

class TrailModel {
  static async getAllTrails() {
    const result = await db.query('SELECT * FROM trail');
    return result.rows;
  }

  static async getTrailById(id) {
    const result = await db.query('SELECT * FROM trail WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createTrail(data) {
    const result = await db.query(
      'INSERT INTO trail (name, description) VALUES ($1, $2) RETURNING *',
      [data.name, data.description]
    );
    return result.rows[0];
  }

  static async updateTrail(id, name, description) {
    const result = await db.query( 'UPDATE trail SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
    );
    return result.rows[0];
  }

  static async deleteTrail(id) {
    const result = await db.query('DELETE FROM trail WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = TrailModel;