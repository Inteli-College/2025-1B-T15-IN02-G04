const request = require('supertest');
const express = require('express');
const app = express();
const ClassUserModel = require('../models/classUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/class-users', async (req, res) => {
  try {
    const classUsers = await ClassUserModel.getAll();
    res.json(classUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações turma-usuário.' });
  }
});

app.post('/class-users', async (req, res) => {
  try {
    const newClassUser = await ClassUserModel.create(req.body);
    res.status(201).json(newClassUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação turma-usuário.' });
  }
});

app.delete('/class-users/:id', async (req, res) => {
  try {
    await ClassUserModel.delete(req.params.id);
    res.json({ message: 'Relação turma-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação turma-usuário.' });
  }
});

jest.mock('../models/classUserModel');

describe('API de Relação Turma-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /class-users - Lista todas as relações
  describe('GET /class-users', () => {
    it('deve retornar todas as relações turma-usuário', async () => {
      const classUsersMock = [
        { id: 1, id_user: 1, id_class: 1 },
        { id: 2, id_user: 2, id_class: 2 }
      ];

      ClassUserModel.getAll.mockResolvedValue(classUsersMock);

      const response = await request(app)
        .get('/class-users')
        .expect(200);

      expect(response.body).toEqual(classUsersMock);
      expect(ClassUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      ClassUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/class-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações turma-usuário.' });
    });
  });

  // POST /class-users - Cria uma nova relação
  describe('POST /class-users', () => {
    it('deve criar uma nova relação turma-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_class: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      ClassUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/class-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(ClassUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_class: 1
      };

      ClassUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/class-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação turma-usuário.' });
    });
  });

  // DELETE /class-users/:id - Remove uma relação
  describe('DELETE /class-users/:id', () => {
    it('deve deletar uma relação turma-usuário', async () => {
      ClassUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/class-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação turma-usuário deletada com sucesso' });
      expect(ClassUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      ClassUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/class-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação turma-usuário.' });
    });
  });
});