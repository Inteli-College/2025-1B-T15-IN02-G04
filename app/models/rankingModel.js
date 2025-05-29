const db = require('../config/db');

class Ranking {
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM ranking ORDER BY score DESC');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar rankings:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM ranking WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar ranking por ID:", error);
      throw error;
    }
  }

  static async create(userId, score) {
    try {
      const result = await db.query(
        'INSERT INTO ranking (id_user, score) VALUES ($1, $2) RETURNING *',
        [userId, score]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar ranking:", error);
      throw error;
    }
  }

  static async update(id, score) {
    try {
      const result = await db.query(
        'UPDATE ranking SET score = $1 WHERE id = $2 RETURNING *',
        [score, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar ranking:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM ranking WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao deletar ranking:", error);
      throw error;
    }
  }
}

module.exports = Ranking;