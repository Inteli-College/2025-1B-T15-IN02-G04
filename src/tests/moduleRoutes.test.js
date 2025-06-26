const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// mocks precisam vir ANTES do require das rotas / controllers
jest.mock('../models/moduleModel');
jest.mock('../models/trailModel');

const ModuleModel = require('../models/moduleModel');
const TrailModel = require('../models/trailModel');

const moduleRoutes = require('../routes/moduleRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/modules', moduleRoutes);

describe('Rotas /modules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /modules', () => {
    it('deve listar todos os módulos', async () => {
      // Arrange
      const modulesMock = [
        { id: 1, name: 'M1' },
        { id: 2, name: 'M2' }
      ];
      ModuleModel.getAllModules.mockResolvedValue(modulesMock);

      // Act
      const { body, status } = await request(app).get('/modules');

      // Assert
      expect(status).toBe(200);
      expect(body).toEqual(modulesMock);
      expect(ModuleModel.getAllModules).toHaveBeenCalledTimes(1);
    });

    it('deve responder 500 quando ocorrer erro', async () => {
      ModuleModel.getAllModules.mockRejectedValue(new Error('db fail'));
      const { status, body } = await request(app).get('/modules');
      expect(status).toBe(500);
      expect(body).toEqual({ error: 'Erro ao listar módulos.' });
    });
  });

  describe('GET /modules/:id', () => {
    it('deve retornar módulo específico', async () => {
      const mod = { id: 10, name: 'MOD' };
      ModuleModel.getModuleById.mockResolvedValue(mod);
      const { status, body } = await request(app).get('/modules/10');
      expect(status).toBe(200);
      expect(body).toEqual(mod);
    });

    it('deve retornar 404 se módulo não existir', async () => {
      ModuleModel.getModuleById.mockResolvedValue(undefined);
      const { status, body } = await request(app).get('/modules/999');
      expect(status).toBe(404);
      expect(body).toEqual({ error: 'Módulo não encontrado' });
    });
  });

  describe('GET /modules/trail/:trailId', () => {
    it('deve retornar módulos da trilha', async () => {
      const trail = { id: 3, name: 'Trilha' };
      const modules = [{ id: 1, trail_id: 3 }];

      TrailModel.getTrailById.mockResolvedValue(trail);
      ModuleModel.getModulesByTrailId.mockResolvedValue(modules);

      const { status, body } = await request(app).get('/modules/trail/3');

      expect(status).toBe(200);
      expect(body).toEqual({ trail, modules });
    });

    it('deve retornar 404 se trilha não existir', async () => {
      TrailModel.getTrailById.mockResolvedValue(null);

      const { status, body } = await request(app).get('/modules/trail/33');

      expect(status).toBe(404);
      expect(body).toEqual({ error: 'Trilha não encontrada' });
    });
  });
}); 