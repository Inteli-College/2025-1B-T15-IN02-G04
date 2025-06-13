const request = require('supertest');
const express = require('express');
const app = express();
const ComentClassModel = require('../models/comentClassModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/coment-classes', async (req, res) => {
  try {
    const comentClasses = await ComentClassModel.getAll();
    res.json(comentClasses);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações comentário-turma.' });
  }
});

app.post('/coment-classes', async (req, res) => {
  try {
    const newComentClass = await ComentClassModel.create(req.body);
    res.status(201).json(newComentClass);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação comentário-turma.' });
  }
});

app.delete('/coment-classes/:id', async (req, res) => {
  try {
    await ComentClassModel.delete(req.params.id);
    res.json({ message: 'Relação comentário-turma deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação comentário-turma.' });
  }
});

jest.mock('../models/comentClassModel');

describe('API de Relação Comentário-Turma', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /coment-classes', () => {
    it('deve retornar todas as relações comentário-turma', async () => {
      const comentClassesMock = [
        { id: 1, id_coment: 1, id_class: 1 },
        { id: 2, id_coment: 2, id_class: 2 }
      ];

      ComentClassModel.getAll.mockResolvedValue(comentClassesMock);

      const response = await request(app)
        .get('/coment-classes')
        .expect(200);

      expect(response.body).toEqual(comentClassesMock);
      expect(ComentClassModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      ComentClassModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/coment-classes')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações comentário-turma.' });
    });
  });

  describe('POST /coment-classes', () => {
    it('deve criar uma nova relação comentário-turma', async () => {
      const novaRelacao = {
        id_coment: 1,
        id_class: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      ComentClassModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/coment-classes')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(ComentClassModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_coment: 1,
        id_class: 1
      };

      ComentClassModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/coment-classes')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação comentário-turma.' });
    });
  });

  describe('DELETE /coment-classes/:id', () => {
    it('deve deletar uma relação comentário-turma', async () => {
      ComentClassModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/coment-classes/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação comentário-turma deletada com sucesso' });
      expect(ComentClassModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      ComentClassModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/coment-classes/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação comentário-turma.' });
    });
  });
});