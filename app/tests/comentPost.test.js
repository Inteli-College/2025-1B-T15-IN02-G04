const request = require('supertest');
const express = require('express');
const app = express();
const ComentPostModel = require('../models/comentPostModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/coment-posts', async (req, res) => {
  try {
    const comentPosts = await ComentPostModel.getAll();
    res.json(comentPosts);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações comentário-post.' });
  }
});

app.post('/coment-posts', async (req, res) => {
  try {
    const newComentPost = await ComentPostModel.create(req.body);
    res.status(201).json(newComentPost);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação comentário-post.' });
  }
});

app.delete('/coment-posts/:id', async (req, res) => {
  try {
    await ComentPostModel.delete(req.params.id);
    res.json({ message: 'Relação comentário-post deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação comentário-post.' });
  }
});

jest.mock('../models/comentPostModel');

describe('API de Relação Comentário-Post', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /coment-posts', () => {
    it('deve retornar todas as relações comentário-post', async () => {
      const comentPostsMock = [
        { id: 1, id_coment: 1, id_post: 1 },
        { id: 2, id_coment: 2, id_post: 2 }
      ];

      ComentPostModel.getAll.mockResolvedValue(comentPostsMock);

      const response = await request(app)
        .get('/coment-posts')
        .expect(200);

      expect(response.body).toEqual(comentPostsMock);
      expect(ComentPostModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      ComentPostModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/coment-posts')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações comentário-post.' });
    });
  });

  describe('POST /coment-posts', () => {
    it('deve criar uma nova relação comentário-post', async () => {
      const novaRelacao = {
        id_coment: 1,
        id_post: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      ComentPostModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/coment-posts')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(ComentPostModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_coment: 1,
        id_post: 1
      };

      ComentPostModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/coment-posts')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação comentário-post.' });
    });
  });

  describe('DELETE /coment-posts/:id', () => {
    it('deve deletar uma relação comentário-post', async () => {
      ComentPostModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/coment-posts/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação comentário-post deletada com sucesso' });
      expect(ComentPostModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      ComentPostModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/coment-posts/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação comentário-post.' });
    });
  });
});