const request = require('supertest');
const express = require('express');
const app = express();
const MeritModel = require('../models/meritModel');

app.use(express.json());

// Routes
app.get('/merits', async (req, res) => {
  try {
    const merits = await MeritModel.getAllMerits();
    res.json(merits);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar méritos.' });
  }
});

app.get('/merits/:id', async (req, res) => {
  try {
    const merit = await MeritModel.getMeritById(req.params.id);
    if (!merit) return res.status(404).json({ error: 'Mérito não encontrado' });
    res.json(merit);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter mérito.' });
  }
});

app.post('/merits', async (req, res) => {
  try {
    const created = await MeritModel.createMerit(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar mérito.' });
  }
});

app.put('/merits/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await MeritModel.updateMerit(req.params.id, name, description);
    if (!updated) return res.status(404).json({ error: 'Mérito não encontrado' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar mérito.' });
  }
});

app.delete('/merits/:id', async (req, res) => {
  try {
    const deleted = await MeritModel.deleteMerit(req.params.id);
    if (deleted) return res.json({ message: 'Mérito deletado com sucesso' });
    res.status(404).json({ error: 'Mérito não encontrado' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao deletar mérito.' });
  }
});

jest.mock('../models/meritModel');

describe('API de Méritos', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /merits', () => {
    it('retorna todos os méritos', async () => {
      const merits = [
        { id: 1, name: 'M1', description: 'D1' },
        { id: 2, name: 'M2', description: 'D2' }
      ];
      MeritModel.getAllMerits.mockResolvedValue(merits);
      const res = await request(app).get('/merits').expect(200);
      expect(res.body).toEqual(merits);
    });
  });

  describe('GET /merits/:id', () => {
    it('retorna mérito específico', async () => {
      const merit = { id: 1, name: 'M1', description: 'D1' };
      MeritModel.getMeritById.mockResolvedValue(merit);
      const res = await request(app).get('/merits/1').expect(200);
      expect(res.body).toEqual(merit);
    });
    it('404 se não existe', async () => {
      MeritModel.getMeritById.mockResolvedValue(null);
      const res = await request(app).get('/merits/999').expect(404);
      expect(res.body).toEqual({ error: 'Mérito não encontrado' });
    });
  });

  describe('POST /merits', () => {
    it('cria mérito', async () => {
      const newM = { name: 'New', description: 'Desc' };
      const created = { id: 1, ...newM };
      MeritModel.createMerit.mockResolvedValue(created);
      const res = await request(app).post('/merits').send(newM).expect(201);
      expect(res.body).toEqual(created);
      expect(MeritModel.createMerit).toHaveBeenCalledWith(newM);
    });
  });

  describe('PUT /merits/:id', () => {
    it('atualiza mérito', async () => {
      const upd = { name: 'Upd', description: 'D' };
      const updated = { id: 1, ...upd };
      MeritModel.updateMerit.mockResolvedValue(updated);
      const res = await request(app).put('/merits/1').send(upd).expect(200);
      expect(res.body).toEqual(updated);
      expect(MeritModel.updateMerit).toHaveBeenCalledWith('1', upd.name, upd.description);
    });
  });

  describe('DELETE /merits/:id', () => {
    it('deleta mérito', async () => {
      MeritModel.deleteMerit.mockResolvedValue(true);
      const res = await request(app).delete('/merits/1').expect(200);
      expect(res.body).toEqual({ message: 'Mérito deletado com sucesso' });
    });
  });
}); 