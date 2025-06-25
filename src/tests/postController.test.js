jest.mock('../models/postModel');
jest.mock('../models/userModel');

const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');
const PostController = require('../controllers/postController');

// helper para res
const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PostController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('listar', () => {
    it('deve retornar 200 com lista', async () => {
      const req = {};
      const res = buildRes();
      const posts = [{ id_post: 1 }];
      PostModel.listarTodos.mockResolvedValue(posts);

      await PostController.listar(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(posts);
    });

    it('deve retornar 500 em erro', async () => {
      const req = {};
      const res = buildRes();
      PostModel.listarTodos.mockRejectedValue(new Error('fail'));

      await PostController.listar(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('criar', () => {
    it('retorna 400 se campo obrigatório faltar', async () => {
      const req = { body: { titulo: '', descricao: '' } };
      const res = buildRes();
      await PostController.criar(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve criar post (201)', async () => {
      const req = { userId: 1, body: { titulo: 't', descricao: 'd', imagem: 'img' } };
      const res = buildRes();
      const newPost = { id_post: 2 };
      PostModel.criarPost.mockResolvedValue(newPost);

      await PostController.criar(req, res);
      expect(PostModel.criarPost).toHaveBeenCalledWith({
        id_user: 1,
        titulo: 't',
        descricao: 'd',
        imagem: 'img'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newPost);
    });

    it('deve retornar 500 quando falhar', async () => {
      const req = { userId: 1, body: { titulo: 't', descricao: 'd' } };
      const res = buildRes();
      PostModel.criarPost.mockRejectedValue(new Error('fail'));

      await PostController.criar(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('buscarPorId', () => {
    it('retorna 404 se não existir', async () => {
      const req = { params: { id: 9 } };
      const res = buildRes();
      PostModel.buscarPorId.mockResolvedValue(undefined);
      await PostController.buscarPorId(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com post', async () => {
      const post = { id_post: 3 };
      const req = { params: { id: 3 } };
      const res = buildRes();
      PostModel.buscarPorId.mockResolvedValue(post);

      await PostController.buscarPorId(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(post);
    });

    it('retorna 500 em erro', async () => {
      const req = { params: { id: 3 } };
      const res = buildRes();
      PostModel.buscarPorId.mockRejectedValue(new Error('db'));
      await PostController.buscarPorId(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deletar', () => {
    it('deve deletar post quando autorizado', async () => {
      const req = { params: { id: 5 }, userId: 1 };
      const res = buildRes();
      const postMock = { name: 'User' };
      const userMock = { autor: 'User' };

      UserModel.buscarPorId.mockResolvedValue(userMock);
      PostModel.buscarPorId.mockResolvedValue(postMock);
      PostModel.deletarPost.mockResolvedValue({ message: 'Post deletado com sucesso' });

      await PostController.deletar(req, res);
      expect(PostModel.deletarPost).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('retorna 401 quando usuário não é autor', async () => {
      const req = { params: { id: 5 }, userId: 2 };
      const res = buildRes();
      UserModel.buscarPorId.mockResolvedValue({ autor: 'X' });
      PostModel.buscarPorId.mockResolvedValue({ name: 'Y' });

      await PostController.deletar(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 500 ao falhar', async () => {
      const req = { params: { id: 5 }, userId: 1 };
      const res = buildRes();
      UserModel.buscarPorId.mockResolvedValue({ autor: 'User' });
      PostModel.buscarPorId.mockResolvedValue({ name: 'User' });
      PostModel.deletarPost.mockRejectedValue(new Error('x'));

      await PostController.deletar(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 