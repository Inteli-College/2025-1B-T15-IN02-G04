const db = require('../config/db');

class AnswerModel {
  static async getAllAnswers() {
    const result = await db.query('SELECT * FROM answer');
    return result.rows;
  }

  static async getAnswerById(id) {
    const result = await db.query('SELECT * FROM answer WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createAnswer(data) {
    const result = await db.query(
      'INSERT INTO answer (answer_text, correct, score, id_question) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.answer_text, data.correct, data.score, data.id_question]
    );
    return result.rows[0];
  }

  static async updateAnswer(id, data) {
    const result = await db.query(
      'UPDATE answer SET answer_text = $1, correct = $2, score = $3, id_question = $4 WHERE id = $5 RETURNING *',
      [data.answer_text, data.correct, data.score, data.id_question, id]
    );
    return result.rows[0];
  }

  static async deleteAnswer(id) {
    const result = await db.query('DELETE FROM answer WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = AnswerModel;