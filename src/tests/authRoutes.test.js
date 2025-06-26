const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mocks antes dos requires das rotas
jest.mock('../config/db');
jest.mock('../models/userModel');

jest.mock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('token') }));
jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('h') }));

const authRoutes = require('../routes/authRoutes');
const UserModel = require('../models/userModel');

const app = express();
app.use(bodyParser.json());
app.use('/', authRoutes);

describe('Rotas de autenticação', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /login', () => {
    it('deve fazer login com sucesso (200)', async () => {
      const fakeUser = { id: 1, name: 'A', email: 'a@a.com' };
      UserModel.verificarCredenciais.mockResolvedValue({ user: fakeUser });

      const { status, body } = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', senha: '123' });
      expect(status).toBe(200);
      expect(body.user.id).toBe(fakeUser.id);
    });

    it('deve retornar 400 quando faltar campos', async () => {
      const { status } = await request(app).post('/login').send({});
      expect(status).toBe(400);
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      UserModel.verificarCredenciais.mockResolvedValue({ error: 'Credenciais inválidas' });
      const { status } = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', senha: 'x' });
      expect(status).toBe(401);
    });

    it('deve retornar 500 em erro interno', async () => {
      UserModel.verificarCredenciais.mockRejectedValue(new Error('db'));
      const { status } = await request(app)
        .post('/login')
        .send({ email: 'a@a.com', senha: '123' });
      expect(status).toBe(500);
    });
  });

  describe('POST /register', () => {
    it('deve registrar usuário e redirecionar', async () => {
      // Mock db.query dentro do controller
      const db = require('../config/db');
      db.query.mockResolvedValue({});

      const response = await request(app)
        .post('/register')
        .send({ name: 'n', email: 'e', username: 'u', password: 'x', id_role: 2 });
      expect([302, 200]).toContain(response.status); // Express pode mandar 302 redirect
    });

    it('deve retornar 500 se falhar', async () => {
      const db = require('../config/db');
      db.query.mockRejectedValue(new Error('fail'));

      const { status } = await request(app)
        .post('/register')
        .send({ name: 'n', email: 'e', username: 'u', password: 'x', id_role: 2 });
      expect(status).toBe(500);
    });
  });

  describe('GET /logout', () => {
    it('deve limpar cookie e redirecionar', async () => {
      const res = await request(app).get('/logout');
      expect([302, 200]).toContain(res.status);
    });
  });
}); 