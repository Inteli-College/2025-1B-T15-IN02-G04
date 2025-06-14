const request = require('supertest');
const express = require('express');
const app = express();
const ModuleModel = require('../models/moduleModel');
const ModuleController = require('../controllers/moduleController');

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

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('ModuleController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllModules', () => {
    it('200', async () => {
      const list = [{ id: 1 }];
      ModuleModel.getAllModules.mockResolvedValue(list);
      const res = mockResponse();
      await ModuleController.getAllModules({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(list);
    });
    it('500', async () => {
      ModuleModel.getAllModules.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await ModuleController.getAllModules({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar módulos.' });
    });
  });

  describe('getModuleById', () => {
    it('200', async () => {
      ModuleModel.getModuleById.mockResolvedValue({ id: 1 });
      const res = mockResponse();
      await ModuleController.getModuleById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('404', async () => {
      ModuleModel.getModuleById.mockResolvedValue(undefined);
      const res = mockResponse();
      await ModuleController.getModuleById({ params: { id: 99 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Módulo não encontrado' });
    });
    it('500', async () => {
      ModuleModel.getModuleById.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await ModuleController.getModuleById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter módulo.' });
    });
  });

  describe('createModule', () => {
    it('201', async () => {
      const payload = { name: 'M' };
      const created = { id: 1, ...payload };
      ModuleModel.createModule.mockResolvedValue(created);
      const res = mockResponse();
      await ModuleController.createModule({ body: payload }, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });
    it('500', async () => {
      ModuleModel.createModule.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await ModuleController.createModule({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar módulo.' });
    });
  });

  describe('updateModule', () => {
    it('200', async () => {
      ModuleModel.updateModule.mockResolvedValue({ id: 1 });
      const req = { params: { id: 1 }, body: { name: 'U', description: 'd', id_trail: 1 } };
      const res = mockResponse();
      await ModuleController.updateModule(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('404', async () => {
      ModuleModel.updateModule.mockResolvedValue(undefined);
      const res = mockResponse();
      await ModuleController.updateModule({ params: { id: 99 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Módulo não encontrado' });
    });
    it('500', async () => {
      ModuleModel.updateModule.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await ModuleController.updateModule({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('deleteModule', () => {
    it('200', async () => {
      ModuleModel.deleteModule.mockResolvedValue(true);
      const res = mockResponse();
      await ModuleController.deleteModule({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Módulo deletado com sucesso' });
    });
    it('500', async () => {
      ModuleModel.deleteModule.mockRejectedValue(new Error('fail'));
      const res = mockResponse();
      await ModuleController.deleteModule({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar módulo.' });
    });
  });
}); 