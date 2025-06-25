const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// mocks antes dos requires
jest.mock('../models/userModel');
jest.mock('../middlewares/authApiMiddleware', () => jest.fn((req, _res, next) => {
  // por padrão rota autorizada
  req.userId = 1;
  next();
}));

const authApiMiddleware = require('../middlewares/authApiMiddleware');
const UserModel = require('../models/userModel');
const userRoutes = require('../routes/userRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/', userRoutes);

describe('Rotas /users', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /ranking', () => {
    it('deve retornar ranking', async () => {
      const ranking = [{ id: 1 }];
      UserModel.listarUsuariosPorScore.mockResolvedValue(ranking);
      const { status, body } = await request(app).get('/ranking');
      expect(status).toBe(200);
      expect(body).toEqual(ranking);
    });

    it('deve retornar 500 erro', async () => {
      UserModel.listarUsuariosPorScore.mockRejectedValue(new Error('x'));
      const { status } = await request(app).get('/ranking');
      expect(status).toBe(500);
    });
  });

  describe('GET /me', () => {
    it('deve retornar perfil do usuário', async () => {
      const user = { id: 1, name: 'A', email: 'a@a.com' };
      const roles = [{ id_role: 2 }];
      UserModel.buscarPorId.mockResolvedValue(user);
      UserModel.buscarRolesPorUsuario.mockResolvedValue(roles);
      const { status, body } = await request(app).get('/me');
      expect(status).toBe(200);
      expect(body).toEqual({ ...user, roles, isAdmin: false });
    });

    it('deve retornar 401 se token inválido', async () => {
      // altera middleware para retornar 401
      authApiMiddleware.mockImplementationOnce((req, res, _next) => res.status(401).json({ error: 'Token inválido' }));
      const { status } = await request(app).get('/me');
      expect(status).toBe(401);
    });

    it('deve retornar 404 se não encontrar usuário', async () => {
      UserModel.buscarPorId.mockResolvedValue(null);
      UserModel.buscarRolesPorUsuario.mockResolvedValue([]);
      const { status } = await request(app).get('/me');
      expect(status).toBe(404);
    });

    it('deve retornar 500 em erro', async () => {
      UserModel.buscarPorId.mockRejectedValue(new Error('db'));
      const { status } = await request(app).get('/me');
      expect(status).toBe(500);
    });
  });

  describe('GET /:id', () => {
    it('deve retornar usuário por id', async () => {
      const user = { id: 3, name: 'U', email: 'u@u.com' };
      const roles = [];
      UserModel.buscarPorId.mockResolvedValue(user);
      UserModel.buscarRolesPorUsuario.mockResolvedValue(roles);
      const { status, body } = await request(app).get('/3');
      expect(status).toBe(200);
      expect(body).toEqual({ ...user, roles, isAdmin: false });
    });

    it('deve retornar 404 se não encontrar', async () => {
      UserModel.buscarPorId.mockResolvedValue(null);
      const { status } = await request(app).get('/99');
      expect(status).toBe(404);
    });

    it('deve retornar 500 em erro', async () => {
      UserModel.buscarPorId.mockRejectedValue(new Error('db'));
      const { status } = await request(app).get('/5');
      expect(status).toBe(500);
    });
  });
}); 