const db = require('../config/db');

class TrailModel {
  static async getAllTrails() {
    try {
      const result = await db.query('SELECT * FROM trail');
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar trilhas:', error);
      throw error;
    }
  }

  static async getTrailById(id) {
    try {
      const result = await db.query('SELECT * FROM trail WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar trilha:', error);
      throw error;
    }
  }

  static async getTrailByName(name) {
    try {
      const result = await db.query('SELECT * FROM trail WHERE name = $1', [name]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar trilha:', error);
      throw error;
    }
  }

  static async createTrail(data) {
    try {
      const result = await db.query(
        'INSERT INTO trail (name, description) VALUES ($1, $2) RETURNING *',
        [data.name, data.description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar trilha:', error);
      throw error;
    }
  }

  static async updateTrail(id, name, description) {
    try {
      const result = await db.query(
        'UPDATE trail SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar trilha:', error);
      throw error;
    }
  }

  static async deleteTrail(id) {
    try {
      const result = await db.query('DELETE FROM trail WHERE id = $1 RETURNING *', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Erro ao deletar trilha:', error);
      throw error;
    }
  }
}

module.exports = TrailModel;