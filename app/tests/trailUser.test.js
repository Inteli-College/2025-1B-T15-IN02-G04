const request = require('supertest');
const express = require('express');
const app = express();
const TrailUserModel = require('../models/trailUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/trail-users', async (req, res) => {
  try {
    const trailUsers = await TrailUserModel.getAll();
    res.json(trailUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações trilha-usuário.' });
  }
});

app.post('/trail-users', async (req, res) => {
  try {
    const newTrailUser = await TrailUserModel.create(req.body);
    res.status(201).json(newTrailUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação trilha-usuário.' });
  }
});

app.delete('/trail-users/:id', async (req, res) => {
  try {
    await TrailUserModel.delete(req.params.id);
    res.json({ message: 'Relação trilha-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação trilha-usuário.' });
  }
});

jest.mock('../models/trailUserModel');

describe('API de Relação Trilha-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /trail-users', () => {
    it('deve retornar todas as relações trilha-usuário', async () => {
      const trailUsersMock = [
        { id: 1, id_user: 1, id_trail: 1 },
        { id: 2, id_user: 2, id_trail: 2 }
      ];

      TrailUserModel.getAll.mockResolvedValue(trailUsersMock);

      const response = await request(app)
        .get('/trail-users')
        .expect(200);

      expect(response.body).toEqual(trailUsersMock);
      expect(TrailUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      TrailUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/trail-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações trilha-usuário.' });
    });
  });

  describe('POST /trail-users', () => {
    it('deve criar uma nova relação trilha-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_trail: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      TrailUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/trail-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(TrailUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_trail: 1
      };

      TrailUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/trail-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação trilha-usuário.' });
    });
  });

  describe('DELETE /trail-users/:id', () => {
    it('deve deletar uma relação trilha-usuário', async () => {
      TrailUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/trail-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação trilha-usuário deletada com sucesso' });
      expect(TrailUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      TrailUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/trail-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação trilha-usuário.' });
    });
  });
});