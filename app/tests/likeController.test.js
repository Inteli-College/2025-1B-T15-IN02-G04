const LikeController = require('../controllers/likeController');
const LikeModel = require('../models/likeModel');

// Mocka todo o módulo do LikeModel
jest.mock('../models/likeModel');

// Helper para simular o objeto de resposta do Express
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('LikeController - createLike', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve criar um like e retornar status 201', async () => {
    const novoLike = {
      id: 1,
      id_user: 1,
      id_post: 2,
      liked: true,
    };

    LikeModel.createLike.mockResolvedValue(novoLike);

    const req = { body: { id_user: 1, id_post: 2 } };
    const res = mockResponse();

    await LikeController.createLike(req, res);

    expect(LikeModel.createLike).toHaveBeenCalledWith({ id_user: 1, id_post: 2 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(novoLike);
  });

  it('deve retornar erro 500 quando ocorrer falha ao criar like', async () => {
    const erroDB = new Error('Falha no banco');
    LikeModel.createLike.mockRejectedValue(erroDB);

    const req = { body: { id_user: 1, id_post: 2 } };
    const res = mockResponse();

    await LikeController.createLike(req, res);

    expect(LikeModel.createLike).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar like.' });
  });
});

// -----------------------------------------------------------------------------
// Testes das demais rotas do LikeController
// -----------------------------------------------------------------------------

describe('LikeController - deleteLike', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve deletar um like e retornar 200', async () => {
    const deletedLike = { id: 1 };
    LikeModel.deleteLike.mockResolvedValue(deletedLike);

    const req = { params: { id: 1 } };
    const res = mockResponse();

    await LikeController.deleteLike(req, res);

    expect(LikeModel.deleteLike).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deletedLike);
  });

  it('deve retornar 404 ao deletar like inexistente', async () => {
    LikeModel.deleteLike.mockResolvedValue(null);
    const req = { params: { id: 999 } };
    const res = mockResponse();

    await LikeController.deleteLike(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Like não encontrado' });
  });

  it('deve retornar erro 500 ao falhar na deleção', async () => {
    LikeModel.deleteLike.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 } };
    const res = mockResponse();

    await LikeController.deleteLike(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar like.' });
  });
});

describe('LikeController - getLikesByPost', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve retornar likes de um post', async () => {
    const likes = [{ id: 1 }];
    LikeModel.getLikesByPost.mockResolvedValue(likes);

    const req = { params: { postId: 2 } };
    const res = mockResponse();

    await LikeController.getLikesByPost(req, res);

    expect(LikeModel.getLikesByPost).toHaveBeenCalledWith(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(likes);
  });

  it('deve retornar erro 500 ao buscar likes por post', async () => {
    LikeModel.getLikesByPost.mockRejectedValue(new Error('falha'));
    const req = { params: { postId: 2 } };
    const res = mockResponse();

    await LikeController.getLikesByPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar likes do post.' });
  });
});

describe('LikeController - getLikesByUser', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve retornar likes de um usuário', async () => {
    const likes = [{ id: 1 }];
    LikeModel.getLikesByUser.mockResolvedValue(likes);

    const req = { params: { userId: 1 } };
    const res = mockResponse();

    await LikeController.getLikesByUser(req, res);

    expect(LikeModel.getLikesByUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(likes);
  });

  it('deve retornar erro 500 ao buscar likes por usuário', async () => {
    LikeModel.getLikesByUser.mockRejectedValue(new Error('falha'));
    const req = { params: { userId: 1 } };
    const res = mockResponse();

    await LikeController.getLikesByUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao buscar likes do usuário.' });
  });
});

describe('LikeController - getLikeCount', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve retornar a contagem de likes de um post', async () => {
    LikeModel.getLikeCount.mockResolvedValue('3');

    const req = { params: { postId: 2 } };
    const res = mockResponse();

    await LikeController.getLikeCount(req, res);

    expect(LikeModel.getLikeCount).toHaveBeenCalledWith(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ count: '3' });
  });

  it('deve retornar erro 500 ao contar likes', async () => {
    LikeModel.getLikeCount.mockRejectedValue(new Error('falha'));
    const req = { params: { postId: 2 } };
    const res = mockResponse();

    await LikeController.getLikeCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao contar likes.' });
  });
});

describe('LikeController - toggleLike', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve alternar like (create/delete) com sucesso', async () => {
    const resultadoToggle = { action: 'created', like: { id: 1 } };
    LikeModel.toggleLike.mockResolvedValue(resultadoToggle);

    const req = { body: { userId: 1, postId: 2 } };
    const res = mockResponse();

    await LikeController.toggleLike(req, res);

    expect(LikeModel.toggleLike).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(resultadoToggle);
  });

  it('deve retornar 400 se userId ou postId faltarem', async () => {
    const req = { body: { userId: 1 } }; // postId ausente
    const res = mockResponse();

    await LikeController.toggleLike(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'userId e postId são obrigatórios' });
    expect(LikeModel.toggleLike).not.toHaveBeenCalled();
  });

  it('deve retornar erro 500 ao alternar like', async () => {
    LikeModel.toggleLike.mockRejectedValue(new Error('falha'));

    const req = { body: { userId: 1, postId: 2 } };
    const res = mockResponse();

    await LikeController.toggleLike(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao alternar like.' });
  });
}); 