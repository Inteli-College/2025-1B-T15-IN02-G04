const UserController = require('../controllers/userController');
const UserModels = require('../models/userModel');

jest.mock('../models/userModel');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// getAllUsers
describe('UserController - getAllUsers', () => {
  afterEach(() => jest.resetAllMocks());

  it('deve retornar todos os usuários com status 200', async () => {
    const users = [{ id: 1 }, { id: 2 }];
    UserModels.getAllUsers.mockResolvedValue(users);
    const req = {};
    const res = mockResponse();
    await UserController.getAllUsers(req, res);
    expect(UserModels.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('deve retornar erro 500 ao falhar', async () => {
    UserModels.getAllUsers.mockRejectedValue(new Error('falha'));
    const req = {};
    const res = mockResponse();
    await UserController.getAllUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'falha' });
  });
});

// getUserById
describe('UserController - getUserById', () => {
  afterEach(() => jest.resetAllMocks());

  it('deve retornar usuário por id com status 200', async () => {
    const user = { id: 1 };
    UserModels.getUserById.mockResolvedValue(user);
    const req = { params: { id: 1 } };
    const res = mockResponse();
    await UserController.getUserById(req, res);
    expect(UserModels.getUserById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it('deve retornar 404 se usuário não encontrado', async () => {
    UserModels.getUserById.mockResolvedValue(undefined);
    const req = { params: { id: 999 } };
    const res = mockResponse();
    await UserController.getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
  });

  it('deve retornar erro 500 ao falhar', async () => {
    UserModels.getUserById.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 } };
    const res = mockResponse();
    await UserController.getUserById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter usuário.' });
  });
});

// createUser
describe('UserController - createUser', () => {
  afterEach(() => jest.resetAllMocks());

  it('deve criar usuário e retornar status 201', async () => {
    const newUser = { id: 1, first_name: 'A' };
    UserModels.createUser.mockResolvedValue(newUser);
    const req = { body: newUser };
    const res = mockResponse();
    await UserController.createUser(req, res);
    expect(UserModels.createUser).toHaveBeenCalledWith(newUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newUser);
  });

  it('deve retornar erro 500 ao falhar', async () => {
    UserModels.createUser.mockRejectedValue(new Error('falha'));
    const req = { body: {} };
    const res = mockResponse();
    await UserController.createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar usuário' });
  });
});

// updateUser
describe('UserController - updateUser', () => {
  afterEach(() => jest.resetAllMocks());

  it('deve atualizar usuário e retornar status 200', async () => {
    const updated = { id: 1, first_name: 'Novo' };
    UserModels.updateUser.mockResolvedValue(updated);
    const req = { params: { id: 1 }, body: { first_name: 'Novo' } };
    const res = mockResponse();
    await UserController.updateUser(req, res);
    expect(UserModels.updateUser).toHaveBeenCalledWith(1, { first_name: 'Novo' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('deve retornar 404 se usuário não encontrado', async () => {
    UserModels.updateUser.mockResolvedValue(undefined);
    const req = { params: { id: 999 }, body: { first_name: 'X' } };
    const res = mockResponse();
    await UserController.updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
  });

  it('deve retornar erro 500 ao falhar', async () => {
    UserModels.updateUser.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 }, body: {} };
    const res = mockResponse();
    await UserController.updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'falha' });
  });
});

// deleteUser
describe('UserController - deleteUser', () => {
  afterEach(() => jest.resetAllMocks());

  it('deve deletar usuário e retornar status 200', async () => {
    UserModels.deleteUser.mockResolvedValue(true);
    const req = { params: { id: 1 } };
    const res = mockResponse();
    await UserController.deleteUser(req, res);
    expect(UserModels.deleteUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(true);
  });

  it('deve retornar 404 se usuário não encontrado', async () => {
    UserModels.deleteUser.mockResolvedValue(false);
    const req = { params: { id: 999 } };
    const res = mockResponse();
    await UserController.deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
  });

  it('deve retornar erro 500 ao falhar', async () => {
    UserModels.deleteUser.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 } };
    const res = mockResponse();
    await UserController.deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'falha' });
  });
}); 