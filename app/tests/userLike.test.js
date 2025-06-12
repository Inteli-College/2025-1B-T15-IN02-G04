const request = require('supertest');
const express = require('express');
const app = express();
const UserLikeModel = require('../models/userLikeModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/user-likes', async (req, res) => {
  try {
    const userLikes = await UserLikeModel.getAll();
    res.json(userLikes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações usuário-curtida.' });
  }
});

app.post('/user-likes', async (req, res) => {
  try {
    const newUserLike = await UserLikeModel.create(req.body);
    res.status(201).json(newUserLike);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação usuário-curtida.' });
  }
});

app.delete('/user-likes/:id', async (req, res) => {
  try {
    await UserLikeModel.delete(req.params.id);
    res.json({ message: 'Relação usuário-curtida deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação usuário-curtida.' });
  }
});

jest.mock('../models/userLikeModel');

describe('API de Relação Usuário-Curtida', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user-likes', () => {
    it('deve retornar todas as relações usuário-curtida', async () => {
      const userLikesMock = [
        { id: 1, id_user: 1, id_like: 1 },
        { id: 2, id_user: 2, id_like: 2 }
      ];

      UserLikeModel.getAll.mockResolvedValue(userLikesMock);

      const response = await request(app)
        .get('/user-likes')
        .expect(200);

      expect(response.body).toEqual(userLikesMock);
      expect(UserLikeModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      UserLikeModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/user-likes')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações usuário-curtida.' });
    });
  });

  describe('POST /user-likes', () => {
    it('deve criar uma nova relação usuário-curtida', async () => {
      const novaRelacao = {
        id_user: 1,
        id_like: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      UserLikeModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/user-likes')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(UserLikeModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_like: 1
      };

      UserLikeModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/user-likes')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação usuário-curtida.' });
    });
  });

  describe('DELETE /user-likes/:id', () => {
    it('deve deletar uma relação usuário-curtida', async () => {
      UserLikeModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/user-likes/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação usuário-curtida deletada com sucesso' });
      expect(UserLikeModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      UserLikeModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/user-likes/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação usuário-curtida.' });
    });
  });
});