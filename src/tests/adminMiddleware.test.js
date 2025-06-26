jest.mock('../models/userModel');
const UserModel = require('../models/userModel');
const adminMiddleware = require('../middlewares/adminMiddleware');

describe('adminMiddleware', () => {
  const build = (userId) => {
    const req = { userId };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  };

  afterEach(() => jest.clearAllMocks());

  it('deve retornar 401 se não houver userId', async () => {
    const { req, res, next } = build(undefined);
    await adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 se usuário não for admin', async () => {
    UserModel.buscarRolesPorUsuario.mockResolvedValue([{ id_role: 2 }]);
    const { req, res, next } = build(1);
    await adminMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next para admin', async () => {
    UserModel.buscarRolesPorUsuario.mockResolvedValue([{ id_role: 1 }]);
    const { req, res, next } = build(1);
    await adminMiddleware(req, res, next);
    expect(req.isAdmin).toBe(true);
    expect(next).toHaveBeenCalled();
  });
}); 