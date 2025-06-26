jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

describe('authMiddleware', () => {
  const build = (path, tokenInCookie) => {
    const req = { path, cookies: {} };
    if (tokenInCookie) req.cookies.token = tokenInCookie;
    const res = { redirect: jest.fn(), clearCookie: jest.fn() };
    const next = jest.fn();
    return { req, res, next };
  };

  afterEach(() => jest.clearAllMocks());

  it('deve redirecionar para /login quando rota protegida sem token', () => {
    const { req, res, next } = build('/dashboard');
    authMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });

  it('deve permitir acesso com token válido', () => {
    jwt.verify.mockReturnValue({ id: 2 });
    const { req, res, next } = build('/dashboard', 'tok');
    authMiddleware(req, res, next);
    expect(req.userId).toBe(2);
    expect(next).toHaveBeenCalled();
  });

  it('deve limpar cookie e redirecionar se token inválido', () => {
    jwt.verify.mockImplementation(() => { throw new Error('bad'); });
    const { req, res, next } = build('/dashboard', 'bad');
    authMiddleware(req, res, next);
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.redirect).toHaveBeenCalledWith('/login');
  });

  it('rota /login com token válido deve redirecionar /dashboard', () => {
    jwt.verify.mockReturnValue({ id: 3 });
    const { req, res, next } = build('/login', 'tok');
    authMiddleware(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/dashboard');
  });
}); 