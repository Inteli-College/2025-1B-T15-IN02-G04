const request = require('supertest');
const express = require('express');
const app = express();
const HierarchyTrailModel = require('../models/hierarchyTrailModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/hierarchy-trails', async (req, res) => {
  try {
    const hierarchyTrails = await HierarchyTrailModel.getAll();
    res.json(hierarchyTrails);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar relações hierarquia-trilha.' });
  }
});

app.post('/hierarchy-trails', async (req, res) => {
  try {
    const newHierarchyTrail = await HierarchyTrailModel.create(req.body);
    res.status(201).json(newHierarchyTrail);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar relação hierarquia-trilha.' });
  }
});

app.delete('/hierarchy-trails/:id', async (req, res) => {
  try {
    await HierarchyTrailModel.delete(req.params.id);
    res.json({ message: 'Relação hierarquia-trilha deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar relação hierarquia-trilha.' });
  }
});

jest.mock('../models/hierarchyTrailModel');

describe('API de Relação Hierarquia-Trilha', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /hierarchy-trails', () => {
    it('deve retornar todas as relações hierarquia-trilha', async () => {
      const hierarchyTrailsMock = [
        { id: 1, id_hierarchy: 1, id_trail: 1 },
        { id: 2, id_hierarchy: 2, id_trail: 2 }
      ];

      HierarchyTrailModel.getAll.mockResolvedValue(hierarchyTrailsMock);

      const response = await request(app)
        .get('/hierarchy-trails')
        .expect(200);

      expect(response.body).toEqual(hierarchyTrailsMock);
      expect(HierarchyTrailModel.getAll).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar relações', async () => {
      HierarchyTrailModel.getAll.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/hierarchy-trails')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar relações hierarquia-trilha.' });
    });
  });

  describe('POST /hierarchy-trails', () => {
    it('deve criar uma nova relação hierarquia-trilha', async () => {
      const novaRelacao = {
        id_hierarchy: 1,
        id_trail: 1
      };

      const relacaoCriadaMock = {
        id: 1,
        ...novaRelacao
      };

      HierarchyTrailModel.create.mockResolvedValue(relacaoCriadaMock);

      const response = await request(app)
        .post('/hierarchy-trails')
        .send(novaRelacao)
        .expect(201);

      expect(response.body).toEqual(relacaoCriadaMock);
      expect(HierarchyTrailModel.create).toHaveBeenCalledWith(novaRelacao);
    });

    it('deve tratar erros ao criar relação', async () => {
      const novaRelacao = {
        id_hierarchy: 1,
        id_trail: 1
      };

      HierarchyTrailModel.create.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .post('/hierarchy-trails')
        .send(novaRelacao)
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao criar relação hierarquia-trilha.' });
    });
  });

  describe('DELETE /hierarchy-trails/:id', () => {
    it('deve deletar uma relação hierarquia-trilha', async () => {
      HierarchyTrailModel.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/hierarchy-trails/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Relação hierarquia-trilha deletada com sucesso' });
      expect(HierarchyTrailModel.delete).toHaveBeenCalledWith('1');
    });

    it('deve tratar erros ao deletar relação', async () => {
      HierarchyTrailModel.delete.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .delete('/hierarchy-trails/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao deletar relação hierarquia-trilha.' });
    });
  });
});