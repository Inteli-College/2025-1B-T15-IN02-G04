jest.mock('../models/userModel');

const UserModel = require('../models/userModel');
const UserController = require('../controllers/userController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('listarRanking', () => {
    it('deve retornar 200 com usuários', async () => {
      const req = {};
      const res = buildRes();
      const users = [{ id: 1 }];
      UserModel.listarUsuariosPorScore.mockResolvedValue(users);
      await UserController.listarRanking(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('deve retornar 500 em erro', async () => {
      const req = {};
      const res = buildRes();
      UserModel.listarUsuariosPorScore.mockRejectedValue(new Error('fail'));
      await UserController.listarRanking(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('meuPerfil', () => {
    it('retorna 404 se usuário não existir', async () => {
      const req = { userId: 9 };
      const res = buildRes();
      UserModel.buscarPorId.mockResolvedValue(null);
      await UserController.meuPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve retornar 200 com perfil', async () => {
      const req = { userId: 1 };
      const res = buildRes();
      const user = { id: 1, name: 'A', email: 'a@a.com' };
      const roles = [{ id_role: 2 }, { id_role: 1 }];
      UserModel.buscarPorId.mockResolvedValue(user);
      UserModel.buscarRolesPorUsuario.mockResolvedValue(roles);
      await UserController.meuPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...user, roles, isAdmin: true });
    });

    it('retorna 500 em erro', async () => {
      const req = { userId: 1 };
      const res = buildRes();
      UserModel.buscarPorId.mockRejectedValue(new Error('x'));
      await UserController.meuPerfil(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('obterUsuario', () => {
    it('retorna 404 quando não achar', async () => {
      const req = { params: { id: 3 } };
      const res = buildRes();
      UserModel.buscarPorId.mockResolvedValue(null);
      await UserController.obterUsuario(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retorna 200 com dados', async () => {
      const req = { params: { id: 3 } };
      const res = buildRes();
      const user = { id: 3, name: 'X', email: 'x@x.com' };
      const roles = [{ id_role: 2 }];
      UserModel.buscarPorId.mockResolvedValue(user);
      UserModel.buscarRolesPorUsuario.mockResolvedValue(roles);
      await UserController.obterUsuario(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ...user, roles, isAdmin: false });
    });

    it('retorna 500 em erro', async () => {
      const req = { params: { id: 1 } };
      const res = buildRes();
      UserModel.buscarPorId.mockRejectedValue(new Error('db'));
      await UserController.obterUsuario(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 