const request = require('supertest');
const express = require('express');
const app = express();
const RoleUserModel = require('../models/roleUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/role-users', async (req, res) => {
  try {
    const roleUsers = await RoleUserModel.getAll();
    res.json(roleUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações função-usuário.' });
  }
});

app.post('/role-users', async (req, res) => {
  try {
    const newRoleUser = await RoleUserModel.create(req.body);
    res.status(201).json(newRoleUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação função-usuário.' });
  }
});

app.delete('/role-users/:id', async (req, res) => {
  try {
    await RoleUserModel.delete(req.params.id);
    res.json({ message: 'Relação função-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação função-usuário.' });
  }
});

jest.mock('../models/roleUserModel');

describe('API de Relação Função-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /role-users', () => {
    it('deve retornar todas as relações função-usuário', async () => {
      const roleUsersMock = [
        { id: 1, id_user: 1, id_role: 1 },
        { id: 2, id_user: 2, id_role: 2 }
      ];

      RoleUserModel.getAll.mockResolvedValue(roleUsersMock);

      const response = await request(app)
        .get('/role-users')
        .expect(200);

      expect(response.body).toEqual(roleUsersMock);
      expect(RoleUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      RoleUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/role-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações função-usuário.' });
    });
  });

  describe('POST /role-users', () => {
    it('deve criar uma nova relação função-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_role: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      RoleUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/role-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(RoleUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_role: 1
      };

      RoleUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/role-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação função-usuário.' });
    });
  });

  describe('DELETE /role-users/:id', () => {
    it('deve deletar uma relação função-usuário', async () => {
      RoleUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/role-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação função-usuário deletada com sucesso' });
      expect(RoleUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      RoleUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/role-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação função-usuário.' });
    });
  });
});