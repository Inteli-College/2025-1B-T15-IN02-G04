const request = require('supertest');
const express = require('express');
const app = express();
const QuestionModel = require('../models/questionModel');

app.use(express.json());

// Routes mock
app.get('/questions', async (req, res) => {
  try {
    const qs = await QuestionModel.getAllQuestions();
    res.json(qs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar questões.' });
  }
});

app.get('/questions/:id', async (req, res) => {
  try {
    const q = await QuestionModel.getQuestionById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Questão não encontrada' });
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter questão.' });
  }
});

app.post('/questions', async (req, res) => {
  try {
    const created = await QuestionModel.createQuestion(req.body);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar questão.' });
  }
});

app.put('/questions/:id', async (req, res) => {
  try {
    const { question_text, id_test } = req.body;
    const updated = await QuestionModel.updateQuestion(req.params.id, question_text, id_test);
    if (!updated) return res.status(404).json({ error: 'Questão não encontrada' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar questão.' });
  }
});

app.delete('/questions/:id', async (req, res) => {
  try {
    const deleted = await QuestionModel.deleteQuestion(req.params.id);
    if (deleted) return res.json({ message: 'Questão deletada com sucesso' });
    res.status(404).json({ error: 'Questão não encontrada' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar questão.' });
  }
});

jest.mock('../models/questionModel');

describe('API de Questões', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /questions', () => {
    it('deve retornar todas as questões', async () => {
      const mockData = [
        { id: 1, question_text: 'Q1', id_test: 1 },
        { id: 2, question_text: 'Q2', id_test: 1 }
      ];
      QuestionModel.getAllQuestions.mockResolvedValue(mockData);
      const res = await request(app).get('/questions').expect(200);
      expect(res.body).toEqual(mockData);
      expect(QuestionModel.getAllQuestions).toHaveBeenCalledTimes(1);
    });
    it('deve lidar com erro', async () => {
      QuestionModel.getAllQuestions.mockRejectedValue(new Error('DB'));
      const res = await request(app).get('/questions').expect(500);
      expect(res.body).toEqual({ error: 'Erro ao listar questões.' });
    });
  });

  describe('GET /questions/:id', () => {
    it('retorna questão específica', async () => {
      const qMock = { id: 1, question_text: 'Q1', id_test: 1 };
      QuestionModel.getQuestionById.mockResolvedValue(qMock);
      const res = await request(app).get('/questions/1').expect(200);
      expect(res.body).toEqual(qMock);
      expect(QuestionModel.getQuestionById).toHaveBeenCalledWith('1');
    });
    it('404 se não encontrada', async () => {
      QuestionModel.getQuestionById.mockResolvedValue(null);
      const res = await request(app).get('/questions/999').expect(404);
      expect(res.body).toEqual({ error: 'Questão não encontrada' });
    });
  });

  describe('POST /questions', () => {
    it('cria nova questão', async () => {
      const newQ = { question_text: 'Nova', id_test: 1 };
      const createdMock = { id: 1, ...newQ };
      QuestionModel.createQuestion.mockResolvedValue(createdMock);
      const res = await request(app).post('/questions').send(newQ).expect(201);
      expect(res.body).toEqual(createdMock);
      expect(QuestionModel.createQuestion).toHaveBeenCalledWith(newQ);
    });
    it('erro ao criar', async () => {
      const newQ = { question_text: 'Nova', id_test: 1 };
      QuestionModel.createQuestion.mockRejectedValue(new Error('DB'));
      const res = await request(app).post('/questions').send(newQ).expect(500);
      expect(res.body).toEqual({ error: 'Erro ao criar questão.' });
    });
  });

  describe('PUT /questions/:id', () => {
    it('atualiza questão', async () => {
      const upd = { question_text: 'Upd', id_test: 2 };
      const upMock = { id: 1, ...upd };
      QuestionModel.updateQuestion.mockResolvedValue(upMock);
      const res = await request(app).put('/questions/1').send(upd).expect(200);
      expect(res.body).toEqual(upMock);
      expect(QuestionModel.updateQuestion).toHaveBeenCalledWith('1', upd.question_text, upd.id_test);
    });
    it('404 se não existe', async () => {
      const upd = { question_text: 'Upd', id_test: 2 };
      QuestionModel.updateQuestion.mockResolvedValue(null);
      const res = await request(app).put('/questions/999').send(upd).expect(404);
      expect(res.body).toEqual({ error: 'Questão não encontrada' });
    });
  });

  describe('DELETE /questions/:id', () => {
    it('deleta questão', async () => {
      QuestionModel.deleteQuestion.mockResolvedValue(true);
      const res = await request(app).delete('/questions/1').expect(200);
      expect(res.body).toEqual({ message: 'Questão deletada com sucesso' });
      expect(QuestionModel.deleteQuestion).toHaveBeenCalledWith('1');
    });
    it('erro ao deletar', async () => {
      QuestionModel.deleteQuestion.mockRejectedValue(new Error('DB'));
      const res = await request(app).delete('/questions/1').expect(500);
      expect(res.body).toEqual({ error: 'Erro ao deletar questão.' });
    });
  });
}); 