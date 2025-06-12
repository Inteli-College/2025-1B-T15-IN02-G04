const request = require('supertest');
const express = require('express');
const app = express();
const TestModel = require('../models/testModel');

app.use(express.json());

// Routes mock
app.get('/tests', async (req, res) => {
  try {
    const tests = await TestModel.getAllTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar testes.' });
  }
});

app.get('/tests/:id', async (req, res) => {
  try {
    const test = await TestModel.getTestById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Teste não encontrado' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter teste.' });
  }
});

app.post('/tests', async (req, res) => {
  try {
    const newTest = await TestModel.createTest(req.body);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar teste.' });
  }
});

app.put('/tests/:id', async (req, res) => {
  try {
    const updated = await TestModel.updateTest(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Teste não encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar teste.' });
  }
});

app.delete('/tests/:id', async (req, res) => {
  try {
    const deleted = await TestModel.deleteTest(req.params.id);
    if (deleted) return res.json({ message: 'Teste deletado com sucesso' });
    res.status(404).json({ error: 'Teste não encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar teste.' });
  }
});

jest.mock('../models/testModel');

describe('API de Testes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /tests', () => {
    it('deve retornar todos os testes', async () => {
      const testsMock = [
        { id: 1, name: 'Teste 1', id_trail: 1 },
        { id: 2, name: 'Teste 2', id_trail: 2 }
      ];
      TestModel.getAllTests.mockResolvedValue(testsMock);
      const res = await request(app).get('/tests').expect(200);
      expect(res.body).toEqual(testsMock);
      expect(TestModel.getAllTests).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erro ao listar', async () => {
      TestModel.getAllTests.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/tests').expect(500);
      expect(res.body).toEqual({ error: 'Erro ao listar testes.' });
    });
  });

  describe('GET /tests/:id', () => {
    it('deve retornar um teste específico', async () => {
      const testMock = { id: 1, name: 'Teste 1', id_trail: 1 };
      TestModel.getTestById.mockResolvedValue(testMock);
      const res = await request(app).get('/tests/1').expect(200);
      expect(res.body).toEqual(testMock);
      expect(TestModel.getTestById).toHaveBeenCalledWith('1');
    });
    it('deve retornar 404 para teste inexistente', async () => {
      TestModel.getTestById.mockResolvedValue(null);
      const res = await request(app).get('/tests/999').expect(404);
      expect(res.body).toEqual({ error: 'Teste não encontrado' });
    });
  });

  describe('POST /tests', () => {
    it('deve criar um novo teste', async () => {
      const newTest = { name: 'Novo Teste', id_trail: 1 };
      const createdMock = { id: 1, ...newTest };
      TestModel.createTest.mockResolvedValue(createdMock);
      const res = await request(app).post('/tests').send(newTest).expect(201);
      expect(res.body).toEqual(createdMock);
      expect(TestModel.createTest).toHaveBeenCalledWith(newTest);
    });
    it('deve lidar com erro ao criar', async () => {
      const newTest = { name: 'Novo Teste', id_trail: 1 };
      TestModel.createTest.mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/tests').send(newTest).expect(500);
      expect(res.body).toEqual({ error: 'Erro ao criar teste.' });
    });
  });

  describe('PUT /tests/:id', () => {
    it('deve atualizar um teste existente', async () => {
      const updates = { name: 'Atualizado', id_trail: 2 };
      const updatedMock = { id: 1, ...updates };
      TestModel.updateTest.mockResolvedValue(updatedMock);
      const res = await request(app).put('/tests/1').send(updates).expect(200);
      expect(res.body).toEqual(updatedMock);
      expect(TestModel.updateTest).toHaveBeenCalledWith('1', updates);
    });
    it('deve retornar 404 se teste não existir', async () => {
      const updates = { name: 'Atualizado', id_trail: 2 };
      TestModel.updateTest.mockResolvedValue(null);
      const res = await request(app).put('/tests/999').send(updates).expect(404);
      expect(res.body).toEqual({ error: 'Teste não encontrado' });
    });
  });

  describe('DELETE /tests/:id', () => {
    it('deve deletar um teste', async () => {
      TestModel.deleteTest.mockResolvedValue(true);
      const res = await request(app).delete('/tests/1').expect(200);
      expect(res.body).toEqual({ message: 'Teste deletado com sucesso' });
      expect(TestModel.deleteTest).toHaveBeenCalledWith('1');
    });
    it('deve lidar com erro ao deletar', async () => {
      TestModel.deleteTest.mockRejectedValue(new Error('DB error'));
      const res = await request(app).delete('/tests/1').expect(500);
      expect(res.body).toEqual({ error: 'Erro ao deletar teste.' });
    });
  });
}); 