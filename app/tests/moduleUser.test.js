const request = require('supertest');
const express = require('express');
const app = express();
const ModuleUserModel = require('../models/moduleUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/module-users', async (req, res) => {
  try {
    const moduleUsers = await ModuleUserModel.getAll();
    res.json(moduleUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações módulo-usuário.' });
  }
});

app.post('/module-users', async (req, res) => {
  try {
    const newModuleUser = await ModuleUserModel.create(req.body);
    res.status(201).json(newModuleUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação módulo-usuário.' });
  }
});

app.delete('/module-users/:id', async (req, res) => {
  try {
    await ModuleUserModel.delete(req.params.id);
    res.json({ message: 'Relação módulo-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação módulo-usuário.' });
  }
});

jest.mock('../models/moduleUserModel');

describe('API de Relação Módulo-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /module-users', () => {
    it('deve retornar todas as relações módulo-usuário', async () => {
      const moduleUsersMock = [
        { id: 1, id_user: 1, id_module: 1 },
        { id: 2, id_user: 2, id_module: 2 }
      ];

      ModuleUserModel.getAll.mockResolvedValue(moduleUsersMock);

      const response = await request(app)
        .get('/module-users')
        .expect(200);

      expect(response.body).toEqual(moduleUsersMock);
      expect(ModuleUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      ModuleUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/module-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações módulo-usuário.' });
    });
  });

  describe('POST /module-users', () => {
    it('deve criar uma nova relação módulo-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_module: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      ModuleUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/module-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(ModuleUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_module: 1
      };

      ModuleUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/module-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação módulo-usuário.' });
    });
  });

  describe('DELETE /module-users/:id', () => {
    it('deve deletar uma relação módulo-usuário', async () => {
      ModuleUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/module-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação módulo-usuário deletada com sucesso' });
      expect(ModuleUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      ModuleUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/module-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação módulo-usuário.' });
    });
  });
});