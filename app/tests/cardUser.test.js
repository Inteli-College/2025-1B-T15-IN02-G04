const request = require('supertest');
const express = require('express');
const app = express();
const CardUserModel = require('../models/cardUserModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/card-users', async (req, res) => {
  try {
    const cardUsers = await CardUserModel.getAll();
    res.json(cardUsers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações cartão-usuário.' });
  }
});

app.post('/card-users', async (req, res) => {
  try {
    const newCardUser = await CardUserModel.create(req.body);
    res.status(201).json(newCardUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação cartão-usuário.' });
  }
});

app.delete('/card-users/:id', async (req, res) => {
  try {
    await CardUserModel.delete(req.params.id);
    res.json({ message: 'Relação cartão-usuário deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação cartão-usuário.' });
  }
});

jest.mock('../models/cardUserModel');

describe('API de Relação Cartão-Usuário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /card-users - Lista todas as relações
  describe('GET /card-users', () => {
    it('deve retornar todas as relações cartão-usuário', async () => {
      const cardUsersMock = [
        { id: 1, id_user: 1, id_card: 1 },
        { id: 2, id_user: 2, id_card: 2 }
      ];

      CardUserModel.getAll.mockResolvedValue(cardUsersMock);

      const response = await request(app)
        .get('/card-users')
        .expect(200);

      expect(response.body).toEqual(cardUsersMock);
      expect(CardUserModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      CardUserModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/card-users')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações cartão-usuário.' });
    });
  });

  // POST /card-users - Cria uma nova relação
  describe('POST /card-users', () => {
    it('deve criar uma nova relação cartão-usuário', async () => {
      const novaRelacao = {
        id_user: 1,
        id_card: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      CardUserModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/card-users')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(CardUserModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_user: 1,
        id_card: 1
      };

      CardUserModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/card-users')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação cartão-usuário.' });
    });
  });

  // DELETE /card-users/:id - Remove uma relação
  describe('DELETE /card-users/:id', () => {
    it('deve deletar uma relação cartão-usuário', async () => {
      CardUserModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/card-users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação cartão-usuário deletada com sucesso' });
      expect(CardUserModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      CardUserModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/card-users/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação cartão-usuário.' });
    });
  });
});