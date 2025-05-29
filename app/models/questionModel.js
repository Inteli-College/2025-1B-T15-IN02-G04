const db = require('../config/db');

class QuestionModel {
  static async getAllQuestions() {
    try {
      const result = await db.query('SELECT * FROM question');
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar todas as questões:", error);
      throw error;
    }
  }

  static async getQuestionById(id) {
    try {
      const result = await db.query('SELECT * FROM question WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao buscar questão por ID:", error);
      throw error;
    }
  }

  static async createQuestion(data) {
    try {
      const result = await db.query(
        'INSERT INTO question (question_text, id_test) VALUES ($1, $2) RETURNING *',
        [data.question_text, data.id_test]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao criar questão:", error);
      throw error;
    }
  }

  static async updateQuestion(id, question_text, id_test) {
    try {
      const result = await db.query(
        'UPDATE question SET question_text = $1, id_test = $2 WHERE id = $3 RETURNING *',
        [question_text, id_test, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Erro ao atualizar questão:", error);
      throw error;
    }
  }

  static async deleteQuestion(id) {
    try {
      const result = await db.query('DELETE FROM question WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erro ao deletar questão:", error);
      throw error;
    }
  }
}

module.exports = QuestionModel;