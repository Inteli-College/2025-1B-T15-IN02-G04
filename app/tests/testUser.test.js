const request = require('supertest');
const express = require('express');
const app = express();
const TestUserModel = require('../models/testUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/test-users', async (req, res) => {
  try {
    const testUsers = await TestUserModel.getAll();
    res.json(testUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações teste-usuário.' });
  }
});

app.post('/test-users', async (req, res) => {
  try {
    const newTestUser = await TestUserModel.create(req.body);
    res.status(201).json(newTestUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação teste-usuário.' });
  }
});

app.delete('/test-users/:id', async (req, res) => {
  try {
    await TestUserModel.delete(req.params.id);
    res.json({ message: 'Relação teste-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação teste-usuário.' });
  }
});

jest.mock('../models/testUserModel');

describe('API de Relação Teste-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /test-users', () => {
    it('deve retornar todas as relações teste-usuário', async () => {
      const testUsersMock = [
        { id: 1, id_user: 1, id_test: 1 },
        { id: 2, id_user: 2, id_test: 2 }
      ];

      TestUserModel.getAll.mockResolvedValue(testUsersMock);

      const response = await request(app)
        .get('/test-users')
        .expect(200);

      expect(response.body).toEqual(testUsersMock);
      expect(TestUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      TestUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/test-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações teste-usuário.' });
    });
  });

  describe('POST /test-users', () => {
    it('deve criar uma nova relação teste-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_test: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      TestUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/test-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(TestUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_test: 1
      };

      TestUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/test-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação teste-usuário.' });
    });
  });

  describe('DELETE /test-users/:id', () => {
    it('deve deletar uma relação teste-usuário', async () => {
      TestUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/test-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação teste-usuário deletada com sucesso' });
      expect(TestUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      TestUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/test-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação teste-usuário.' });
    });
  });
});