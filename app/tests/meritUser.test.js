const request = require('supertest');
const express = require('express');
const app = express();
const MeritUserModel = require('../models/meritUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/merit-users', async (req, res) => {
  try {
    const meritUsers = await MeritUserModel.getAll();
    res.json(meritUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações mérito-usuário.' });
  }
});

app.post('/merit-users', async (req, res) => {
  try {
    const newMeritUser = await MeritUserModel.create(req.body);
    res.status(201).json(newMeritUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação mérito-usuário.' });
  }
});

app.delete('/merit-users/:id', async (req, res) => {
  try {
    await MeritUserModel.delete(req.params.id);
    res.json({ message: 'Relação mérito-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação mérito-usuário.' });
  }
});

jest.mock('../models/meritUserModel');

describe('API de Relação Mérito-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /merit-users', () => {
    it('deve retornar todas as relações mérito-usuário', async () => {
      const meritUsersMock = [
        { id: 1, id_user: 1, id_merit: 1 },
        { id: 2, id_user: 2, id_merit: 2 }
      ];

      MeritUserModel.getAll.mockResolvedValue(meritUsersMock);

      const response = await request(app)
        .get('/merit-users')
        .expect(200);

      expect(response.body).toEqual(meritUsersMock);
      expect(MeritUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      MeritUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/merit-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações mérito-usuário.' });
    });
  });

  describe('POST /merit-users', () => {
    it('deve criar uma nova relação mérito-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_merit: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      MeritUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/merit-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(MeritUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_merit: 1
      };

      MeritUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/merit-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação mérito-usuário.' });
    });
  });

  describe('DELETE /merit-users/:id', () => {
    it('deve deletar uma relação mérito-usuário', async () => {
      MeritUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/merit-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação mérito-usuário deletada com sucesso' });
      expect(MeritUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      MeritUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/merit-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação mérito-usuário.' });
    });
  });
});