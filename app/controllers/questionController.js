const QuestionModel = require('../models/questionModel');

const QuestionController = {

  async getAllQuestions(req, res) {
    try {
      const questions = await QuestionModel.getAllQuestions();
      return res.status(200).json(questions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar questões.' });
    }
  },

  async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const question = await QuestionModel.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ error: 'QUestão não encontrada' });
      }
      return res.status(200).json(question);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter questão.' });
    }
  },

  async createQuestion(req, res) {
    try {
      const newQuestion = await QuestionModel.createQuestion(req.body);
      return res.status(201).json(newQuestion);
      } catch (err) {
        console.error('Erro ao criar questões:', err); 
        res.status(500).json({ error: 'Erro ao criar questões.' });
      }
  },

    async updateQuestion(req, res) {
      try {
        const { question_text, id_test } = req.body;
        const updatedQuestion = await QuestionModel.updateQuestion(req.params.id, question_text, id_test);
        if (updatedQuestion) {
        res.status(200).json(updatedQuestion);
        } else {
        res.status(404).json({ error: 'Questão não encontrada' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteQuestion(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const questionDelete = await QuestionModel.deleteQuestion(id);
      return res.status(200).json({ message: 'Questão deletada com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar questão:', err);
      res.status(500).json({ error: 'Erro ao deletar questão.' });
    }
  }
};

module.exports = QuestionController;