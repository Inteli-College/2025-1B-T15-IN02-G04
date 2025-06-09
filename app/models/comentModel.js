const db = require('../config/db');

class ComentModel {
  static async getAllComents() {
    const result = await db.query('SELECT * FROM coment');
    return result.rows;
  }

  static async getComentById(id) {
    const result = await db.query('SELECT * FROM coment WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createComent(data) {
    const result = await db.query(
      'INSERT INTO Coment (id_user, coment) VALUES ($1, $2) RETURNING *',
      [data.id_user, data.coment]
    );
    return result.rows[0];
  }

  static async updateComent(id, id_user, coment) {
    const result = await db.query( 'UPDATE coment SET id_user = $1, coment = $2 WHERE id = $3 RETURNING *',
    [id_user, coment, id]
    );
    return result.rows[0];
  }

  static async deleteComent(id) {
    const result = await db.query('DELETE FROM coment WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = ComentModel;