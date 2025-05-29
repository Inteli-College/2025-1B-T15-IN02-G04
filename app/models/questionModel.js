const db = require('../config/db');

class QuestionModel {
  static async getAllQuestions() {
    const result = await db.query('SELECT * FROM question');
    return result.rows;
  }

  static async getQuestionById(id) {
    const result = await db.query('SELECT * FROM question WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createQuestion(data) {
    const result = await db.query(
      'INSERT INTO question (question_text, id_test) VALUES ($1, $2) RETURNING *',
      [data.question_text, data.id_test]
    );
    return result.rows[0];
  }

  static async updateQuestion(id, data) {
    const result = await db.query(
      'UPDATE question SET question_text = $1, id_test = $2 WHERE id = $3 RETURNING *',
      [data.question_text, data.id_test, id]
    );
    return result.rows[0];
  }

  static async deleteTest(id) {
    const result = await db.query('DELETE FROM test WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
  }
}

module.exports = QuestionModel;