jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');
const authApiMiddleware = require('../middlewares/authApiMiddleware');

describe('authApiMiddleware', () => {
  const buildMocks = (token) => {
    const req = { cookies: {} };
    if (token) req.cookies.token = token;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  };

  afterEach(() => jest.clearAllMocks());

  it('deve retornar 401 se não houver token', () => {
    const { req, res, next } = buildMocks();
    authApiMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token de acesso requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next quando token válido', () => {
    jwt.verify.mockReturnValue({ id: 10 });
    const { req, res, next } = buildMocks('token');
    authApiMiddleware(req, res, next);
    expect(req.userId).toBe(10);
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar 401 para token inválido', () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    const { req, res, next } = buildMocks('bad');
    authApiMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });
}); 