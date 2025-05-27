const db = require('../config/db'); // Importa o módulo de banco de dados

class Ranking {
  static async getAll() {
    const result = await db.query('SELECT * FROM rankings ORDER BY score DESC');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM rankings WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(userId, score) {
    const result = await db.query(
      'INSERT INTO rankings (user_id, score) VALUES ($1, $2) RETURNING *',
      [userId, score]
    );
    return result.rows[0];
  }

  static async update(id, score) {
    const result = await db.query(
      'UPDATE rankings SET score = $1 WHERE id = $2 RETURNING *',
      [score, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM rankings WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Ranking;