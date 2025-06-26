jest.mock('../config/db');
jest.mock('../models/userModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { login, register, logout } = require('../controllers/authController');

// util para construir objeto res mockado
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('deve registrar usuário e redirecionar /login (200 implícito)', async () => {
      // Arrange
      const req = {
        body: { name: 'n', email: 'e', username: 'u', password: '123', id_role: 2 }
      };
      const res = buildRes();

      // mock bcrypt & db
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
      const db = require('../config/db');
      db.query.mockResolvedValue({});

      // Act
      await register(req, res);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
      expect(db.query).toHaveBeenCalledTimes(2);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

    it('deve retornar 500 em erro', async () => {
      const req = { body: { name: 'n', email: 'e', username: 'u', password: 'x', id_role: 2 } };
      const res = buildRes();
      const db = require('../config/db');
      db.query.mockRejectedValue(new Error('fail'));
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('h');

      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao registrar usuário' });
    });
  });

  describe('login', () => {
    it('deve retornar 400 se faltar campos', async () => {
      const req = { body: { email: '', senha: '' } };
      const res = buildRes();

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 401 para credenciais inválidas', async () => {
      const req = { body: { email: 'a@a.com', senha: 'x' } };
      const res = buildRes();

      UserModel.verificarCredenciais.mockResolvedValue({ error: 'Credenciais inválidas' });
      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });

    it('deve efetuar login e retornar 200 + cookie', async () => {
      const req = { body: { email: 'a@a.com', senha: '123' } };
      const res = buildRes();
      const fakeUser = { id: 1, email: 'a@a.com', name: 'A' };

      UserModel.verificarCredenciais.mockResolvedValue({ user: fakeUser });
      jest.spyOn(jwt, 'sign').mockReturnValue('token');

      await login(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('token', 'token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login realizado com sucesso',
        user: { id: fakeUser.id, nome: fakeUser.name, email: fakeUser.email }
      });
    });

    it('deve retornar 500 quando ocorrer erro inesperado', async () => {
      const req = { body: { email: 'x@x.com', senha: '123' } };
      const res = buildRes();
      UserModel.verificarCredenciais.mockRejectedValue(new Error('db'));

      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('logout', () => {
    it('deve limpar cookie e redirecionar', () => {
      const req = {};
      const res = buildRes();
      logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith('token', { httpOnly: true, sameSite: 'strict' });
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  });
}); 