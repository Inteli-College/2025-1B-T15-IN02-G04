const request = require('supertest');
const express = require('express');
const app = express();
const ModuleModel = require('../models/moduleModel');

app.use(express.json());

// Routes mock
app.get('/modules', async (req, res) => {
  try {
    const mods = await ModuleModel.getAllModules();
    res.json(mods);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar módulos.' });
  }
});

app.get('/modules/:id', async (req, res) => {
  try {
    const mod = await ModuleModel.getModuleById(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Módulo não encontrado' });
    res.json(mod);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter módulo.' });
  }
});

app.get('/modules/trail/:trailId', async (req, res) => {
  try {
    const mods = await ModuleModel.getModulesByTrailId(req.params.trailId);
    res.json(mods);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter módulos por trilha.' });
  }
});

app.post('/modules', async (req, res) => {
  try {
    const created = await ModuleModel.createModule(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar módulo.' });
  }
});

app.put('/modules/:id', async (req, res) => {
  try {
    const { name, description, id_trail } = req.body;
    const updated = await ModuleModel.updateModule(req.params.id, name, description, id_trail);
    if (!updated) return res.status(404).json({ error: 'Módulo não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar módulo.' });
  }
});

app.delete('/modules/:id', async (req, res) => {
  try {
    const deleted = await ModuleModel.deleteModule(req.params.id);
    if (deleted) return res.json({ message: 'Módulo deletado com sucesso' });
    res.status(404).json({ error: 'Módulo não encontrado' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar módulo.' });
  }
});

jest.mock('../models/moduleModel');

describe('API de Módulos', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /modules', () => {
    it('retorna todos os módulos', async () => {
      const mods = [
        { id: 1, name: 'Mod1', description: 'Desc', id_trail: 1 },
        { id: 2, name: 'Mod2', description: 'Desc2', id_trail: 2 }
      ];
      ModuleModel.getAllModules.mockResolvedValue(mods);
      const res = await request(app).get('/modules').expect(200);
      expect(res.body).toEqual(mods);
    });
    it('erro ao listar', async () => {
      ModuleModel.getAllModules.mockRejectedValue(new Error('DB'));
      const res = await request(app).get('/modules').expect(500);
      expect(res.body).toEqual({ error: 'Erro ao listar módulos.' });
    });
  });

  describe('GET /modules/:id', () => {
    it('retorna módulo específico', async () => {
      const mod = { id: 1, name: 'Mod1', description: 'Desc', id_trail: 1 };
      ModuleModel.getModuleById.mockResolvedValue(mod);
      const res = await request(app).get('/modules/1').expect(200);
      expect(res.body).toEqual(mod);
    });
    it('404 se não encontrado', async () => {
      ModuleModel.getModuleById.mockResolvedValue(null);
      const res = await request(app).get('/modules/999').expect(404);
      expect(res.body).toEqual({ error: 'Módulo não encontrado' });
    });
  });

  describe('GET /modules/trail/:trailId', () => {
    it('retorna módulos por trilha', async () => {
      const mods = [{ id: 1, name: 'Mod1', description: 'd', id_trail: 1 }];
      ModuleModel.getModulesByTrailId.mockResolvedValue(mods);
      const res = await request(app).get('/modules/trail/1').expect(200);
      expect(res.body).toEqual(mods);
    });
  });

  describe('POST /modules', () => {
    it('cria módulo', async () => {
      const newMod = { name: 'New', description: 'D', id_trail: 1 };
      const created = { id: 1, ...newMod };
      ModuleModel.createModule.mockResolvedValue(created);
      const res = await request(app).post('/modules').send(newMod).expect(201);
      expect(res.body).toEqual(created);
      expect(ModuleModel.createModule).toHaveBeenCalledWith(newMod);
    });
  });

  describe('PUT /modules/:id', () => {
    it('atualiza módulo', async () => {
      const upd = { name: 'Up', description: 'D', id_trail: 1 };
      const updated = { id: 1, ...upd };
      ModuleModel.updateModule.mockResolvedValue(updated);
      const res = await request(app).put('/modules/1').send(upd).expect(200);
      expect(res.body).toEqual(updated);
      expect(ModuleModel.updateModule).toHaveBeenCalledWith('1', upd.name, upd.description, upd.id_trail);
    });
  });

  describe('DELETE /modules/:id', () => {
    it('deleta módulo', async () => {
      ModuleModel.deleteModule.mockResolvedValue(true);
      const res = await request(app).delete('/modules/1').expect(200);
      expect(res.body).toEqual({ message: 'Módulo deletado com sucesso' });
    });
  });
}); 