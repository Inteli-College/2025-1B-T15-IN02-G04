const AnswerModel = require('../models/answerModel');

const AnswerController = {

  async getAllAnswers(req, res) {
    try {
      const answers = await AnswerModel.getAllAnswers();
      return res.status(200).json(answers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar respostas.' });
    }
  },

  async getAnswerById(req, res) {
    try {
      const { id } = req.params;
      const answer = await AnswerModel.getAnswerById(id);
      if (!answer) {
        return res.status(404).json({ error: 'Resposta não encontrado' });
      }
      return res.status(200).json(answer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter resposta.' });
    }
  },

  async createAnswer(req, res) {
    try {
      const newAnswer = await AnswerModel.createAnswer(req.body);
      return res.status(201).json(newAnswer);
      } catch (err) {
        console.error('Erro ao criar resposta:', err); 
        res.status(500).json({ error: 'Erro ao criar resposta.' });
      }
  },

    async updateAnswer(req, res) {
      try {
        const { answer_text, correct, score, id_question } = req.body;
        const updatedAnswer = await AnswerModel.updateAnswer(req.params.id, answer_text, correct, score, id_question);
        if (updatedAnswer) {
        res.status(200).json(updatedAnswer);
        } else {
        res.status(404).json({ error: 'Resposta não encontrada' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
   },

    async deleteAnswer(req, res) {
    try {
      const id = parseInt(req.params.id); 
      const answerDelete = await AnswerModel.deleteAnswer(id);
      return res.status(200).json({ message: 'Resposta deletada com sucesso' });
    } catch (err) {
      console.error('Erro ao deletar resposta:', err);
      res.status(500).json({ error: 'Erro ao deletar resposta.' });
    }
  }
};

module.exports = AnswerController;