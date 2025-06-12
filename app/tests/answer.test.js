const request = require('supertest');
const express = require('express');
const app = express();
const AnswerModel = require('../models/answerModel');

// Configurar o app para os testes
app.use(express.json());

// Mock das rotas
app.get('/answers', async (req, res) => {
  try {
    const answers = await AnswerModel.getAllAnswers();
    res.json(answers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar respostas.' });
  }
});

app.get('/answers/:id', async (req, res) => {
  try {
    const answer = await AnswerModel.getAnswerById(req.params.id);
    if (!answer) {
      return res.status(404).json({ error: 'Resposta não encontrado' });
    }
    res.json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter resposta.' });
  }
});

app.post('/answers', async (req, res) => {
  try {
    const newAnswer = await AnswerModel.createAnswer(req.body);
    res.status(201).json(newAnswer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar resposta.' });
  }
});

app.put('/answers/:id', async (req, res) => {
  try {
    const updatedAnswer = await AnswerModel.updateAnswer(
      req.params.id,
      req.body.answer_text,
      req.body.correct,
      req.body.score,
      req.body.id_question
    );
    if (!updatedAnswer) {
      return res.status(404).json({ error: 'Resposta não encontrada' });
    }
    res.json(updatedAnswer);
  } catch (error) {
    res.status(500).json({ error: 'Erro no banco de dados' });
  }
});

app.delete('/answers/:id', async (req, res) => {
  try {
    const deleted = await AnswerModel.deleteAnswer(req.params.id);
    if (deleted) {
      res.json({ message: 'Resposta deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Resposta não encontrada' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar resposta.' });
  }
});

jest.mock('../models/answerModel');

describe('API de Respostas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/answers - Lista todas as respostas
  describe('GET /answers', () => {
    it('deve retornar todas as respostas', async () => {
      const respostasMock = [
        { id: 1, answer_text: 'Resposta Teste 1', correct: true, score: 10, id_question: 1 },
        { id: 2, answer_text: 'Resposta Teste 2', correct: false, score: 0, id_question: 1 }
      ];

      AnswerModel.getAllAnswers.mockResolvedValue(respostasMock);

      const response = await request(app)
        .get('/answers')
        .expect(200);

      expect(response.body).toEqual(respostasMock);
      expect(AnswerModel.getAllAnswers).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar respostas', async () => {
      AnswerModel.getAllAnswers.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/answers')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar respostas.' });
    });
  });

  // GET /api/answers/:id - Obtém uma resposta específica
  describe('GET /answers/:id', () => {
    it('deve retornar uma resposta específica por id', async () => {
      const respostaMock = {
        id: 1,
        answer_text: 'Resposta Teste',
        correct: true,
        score: 10,
        id_question: 1
      };

      AnswerModel.getAnswerById.mockResolvedValue(respostaMock);

      const response = await request(app)
        .get('/answers/1')
        .expect(200);

      expect(response.body).toEqual(respostaMock);
      expect(AnswerModel.getAnswerById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 quando resposta não for encontrada', async () => {
      AnswerModel.getAnswerById.mockResolvedValue(null);

      const response = await request(app)
        .get('/answers/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Resposta não encontrado' });
    });

    it('deve tratar erros ao buscar resposta por id', async () => {
      AnswerModel.getAnswerById.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/answers/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao obter resposta.' });
    });
  });

  // POST /api/answers - Cria uma nova resposta
  describe('POST /answers', () => {
    it('deve criar uma nova resposta', async () => {
      const novaResposta = {
        answer_text: 'Nova Resposta Teste',
        correct: true,
        score: 10,
        id_question: 1
      };

      const respostaCriadaMock = {
        id: 1,
        ...novaResposta
      };

      AnswerModel.createAnswer.mockResolvedValue(respostaCriadaMock);

      const response = await request(app)
        .post('/answers')
        .send(novaResposta)
        .expect(201);

      expect(response.body).toEqual(respostaCriadaMock);
      expect(AnswerModel.createAnswer).toHaveBeenCalledWith(novaResposta);
    });

    it('deve tratar erros ao criar resposta', async () => {
      const novaResposta = {
        answer_text: 'Nova Resposta Teste',
        correct: true,
        score: 10,
        id_question: 1
      };

      AnswerModel.createAnswer.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/answers')
        .send(novaResposta)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar resposta.' });
    });
  });

  // PUT /api/answers/:id - Atualiza uma resposta existente
  describe('PUT /answers/:id', () => {
    it('deve atualizar uma resposta existente', async () => {
      const respostaAtualizada = {
        answer_text: 'Resposta Atualizada',
        correct: false,
        score: 5,
        id_question: 1
      };

      const respostaAtualizadaMock = {
        id: 1,
        ...respostaAtualizada
      };

      AnswerModel.updateAnswer.mockResolvedValue(respostaAtualizadaMock);

      const response = await request(app)
        .put('/answers/1')
        .send(respostaAtualizada)
        .expect(200);

      expect(response.body).toEqual(respostaAtualizadaMock);
      expect(AnswerModel.updateAnswer).toHaveBeenCalledWith(
        '1',
        respostaAtualizada.answer_text,
        respostaAtualizada.correct,
        respostaAtualizada.score,
        respostaAtualizada.id_question
      );
    });

    it('deve retornar 404 ao atualizar resposta inexistente', async () => {
      const respostaAtualizada = {
        answer_text: 'Resposta Atualizada',
        correct: false,
        score: 5,
        id_question: 1
      };

      AnswerModel.updateAnswer.mockResolvedValue(null);

      const response = await request(app)
        .put('/answers/999')
        .send(respostaAtualizada)
        .expect(404);

      expect(response.body).toEqual({ error: 'Resposta não encontrada' });
    });

    it('deve tratar erros ao atualizar resposta', async () => {
      const respostaAtualizada = {
        answer_text: 'Resposta Atualizada',
        correct: false,
        score: 5,
        id_question: 1
      };

      AnswerModel.updateAnswer.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .put('/answers/1')
        .send(respostaAtualizada)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro no banco de dados' });
    });
  });

  // DELETE /api/answers/:id - Remove uma resposta
  describe('DELETE /answers/:id', () => {
    it('deve deletar uma resposta', async () => {
      AnswerModel.deleteAnswer.mockResolvedValue(true);

      const response = await request(app)
        .delete('/answers/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Resposta deletada com sucesso' });
      expect(AnswerModel.deleteAnswer).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar resposta', async () => {
      AnswerModel.deleteAnswer.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/answers/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar resposta.' });
    });
  });
}); 