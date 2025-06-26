const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// mocks antes dos requires das rotas
jest.mock('../models/postModel');
jest.mock('../models/userModel');
jest.mock('../middlewares/authMiddleware', () => jest.fn((req, res, next) => {
  if (req.headers['x-fail']) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  req.userId = 1;
  next();
}));

const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');
const postRoutes = require('../routes/postRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/', postRoutes);

describe('Rotas /posts', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('deve listar posts', async () => {
      const list = [{ id_post: 1 }];
      PostModel.listarTodos.mockResolvedValue(list);
      const { status, body } = await request(app).get('/');
      expect(status).toBe(200);
      expect(body).toEqual(list);
    });

    it('deve retornar 500 em erro', async () => {
      PostModel.listarTodos.mockRejectedValue(new Error('db'));
      const { status } = await request(app).get('/');
      expect(status).toBe(500);
    });
  });

  describe('GET /:id', () => {
    it('deve retornar post específico', async () => {
      const post = { id_post: 3 };
      PostModel.buscarPorId.mockResolvedValue(post);
      const { status, body } = await request(app).get('/3');
      expect(status).toBe(200);
      expect(body).toEqual(post);
    });

    it('deve retornar 404 se não existir', async () => {
      PostModel.buscarPorId.mockResolvedValue(undefined);
      const { status } = await request(app).get('/999');
      expect(status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('deve criar post (201)', async () => {
      const newPost = { id_post: 10 };
      PostModel.criarPost.mockResolvedValue(newPost);
      const { status, body } = await request(app)
        .post('/')
        .send({ titulo: 't', descricao: 'd' });
      expect(status).toBe(201);
      expect(body).toEqual(newPost);
    });

    it('retorna 400 se dados incompletos', async () => {
      const { status } = await request(app).post('/').send({});
      expect(status).toBe(400);
    });

    it('retorna 401 se token inválido', async () => {
      const { status } = await request(app)
        .post('/')
        .set('x-fail', '1')
        .send({ titulo: 't', descricao: 'd' });
      expect(status).toBe(401);
    });

    it('retorna 500 em erro', async () => {
      PostModel.criarPost.mockRejectedValue(new Error('x'));
      const { status } = await request(app)
        .post('/')
        .send({ titulo: 't', descricao: 'd' });
      expect(status).toBe(500);
    });
  });

  describe('DELETE /:id', () => {
    it('deve deletar quando autorizado', async () => {
      const user = { autor: 'User' };
      const post = { name: 'User' };
      UserModel.buscarPorId.mockResolvedValue(user);
      PostModel.buscarPorId.mockResolvedValue(post);
      PostModel.deletarPost.mockResolvedValue({});
      const { status } = await request(app).delete('/5');
      expect(status).toBe(200);
    });

    it('retorna 401 quando não autorizado', async () => {
      const user = { autor: 'A' };
      const post = { name: 'B' };
      UserModel.buscarPorId.mockResolvedValue(user);
      PostModel.buscarPorId.mockResolvedValue(post);
      const { status } = await request(app).delete('/5');
      expect(status).toBe(401);
    });

    it('retorna 500 se erro', async () => {
      const user = { autor: 'User' };
      const post = { name: 'User' };
      UserModel.buscarPorId.mockResolvedValue(user);
      PostModel.buscarPorId.mockResolvedValue(post);
      PostModel.deletarPost.mockRejectedValue(new Error('db'));
      const { status } = await request(app).delete('/5');
      expect(status).toBe(500);
    });
  });
}); 