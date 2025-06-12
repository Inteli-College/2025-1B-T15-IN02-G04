const PostController = require('../controllers/postController');
const PostModel = require('../models/postModel');

// Faz o mock do módulo PostModel inteiro
jest.mock('../models/postModel');

// Função helper para criar mocks de resposta Express
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PostController - createPost', () => {
  afterEach(() => {
    // Limpa todas as mocks entre os testes
    jest.resetAllMocks();
  });

  it('deve criar um novo post e retornar status 201', async () => {
    const novoPost = {
      id: 1,
      id_user: 1,
      title: 'Título do post',
      description: 'Descrição do post',
      image: 'https://example.com/imagem.png',
    };

    // Configura o mock para resolver com o novo post
    PostModel.createPost.mockResolvedValue(novoPost);

    const req = { body: novoPost };
    const res = mockResponse();

    await PostController.createPost(req, res);

    // Verifica se o model foi chamado corretamente
    expect(PostModel.createPost).toHaveBeenCalledWith(novoPost);

    // Verifica se o controller respondeu corretamente
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(novoPost);
  });

  it('deve retornar erro 500 quando ocorrer falha ao criar post', async () => {
    const erroDB = new Error('Falha de banco de dados');
    PostModel.createPost.mockRejectedValue(erroDB);

    const req = { body: {} };
    const res = mockResponse();

    await PostController.createPost(req, res);

    expect(PostModel.createPost).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao criar post.' });
  });
});


describe('PostController - outras rotas', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  // ----------------- getAllPosts -----------------
  it('deve listar todos os posts e retornar 200', async () => {
    const posts = [{ id: 1 }, { id: 2 }];
    PostModel.getAllPosts.mockResolvedValue(posts);

    const req = {};
    const res = mockResponse();

    await PostController.getAllPosts(req, res);

    expect(PostModel.getAllPosts).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(posts);
  });

  it('deve retornar erro 500 quando falhar ao listar posts', async () => {
    PostModel.getAllPosts.mockRejectedValue(new Error('falha'));
    const req = {};
    const res = mockResponse();

    await PostController.getAllPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao listar posts.' });
  });

  // ----------------- getPostById -----------------
  it('deve buscar um post por id e retornar 200', async () => {
    const post = { id: 1 };
    PostModel.getPostById.mockResolvedValue(post);

    const req = { params: { id: 1 } };
    const res = mockResponse();

    await PostController.getPostById(req, res);

    expect(PostModel.getPostById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(post);
  });

  it('deve retornar 404 quando post não for encontrado', async () => {
    PostModel.getPostById.mockResolvedValue(undefined);
    const req = { params: { id: 999 } };
    const res = mockResponse();

    await PostController.getPostById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Post não encontrado' });
  });

  it('deve retornar erro 500 quando falhar ao buscar post', async () => {
    PostModel.getPostById.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 } };
    const res = mockResponse();

    await PostController.getPostById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao obter post.' });
  });

  // ----------------- updatePost -----------------
  it('deve atualizar um post existente e retornar 200', async () => {
    const updated = { id: 1, title: 'novo' };
    PostModel.updatePost.mockResolvedValue(updated);

    const req = { params: { id: 1 }, body: { title: 'novo' } };
    const res = mockResponse();

    await PostController.updatePost(req, res);

    expect(PostModel.updatePost).toHaveBeenCalledWith(1, { title: 'novo' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it('deve retornar 404 ao tentar atualizar post inexistente', async () => {
    PostModel.updatePost.mockResolvedValue(undefined);
    const req = { params: { id: 999 }, body: { title: 'abc' } };
    const res = mockResponse();

    await PostController.updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Post não encontrado' });
  });

  it('deve retornar erro 500 quando falhar ao atualizar post', async () => {
    PostModel.updatePost.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 }, body: {} };
    const res = mockResponse();

    await PostController.updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  // ----------------- deletePost -----------------
  it('deve deletar um post e retornar 200', async () => {
    PostModel.deletePost.mockResolvedValue(true);
    const req = { params: { id: 1 } };
    const res = mockResponse();

    await PostController.deletePost(req, res);

    expect(PostModel.deletePost).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post deletado com sucesso' });
  });

  it('deve retornar 404 ao tentar deletar post inexistente', async () => {
    PostModel.deletePost.mockResolvedValue(false);
    const req = { params: { id: 999 } };
    const res = mockResponse();

    await PostController.deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Post não encontrado' });
  });

  it('deve retornar erro 500 quando falhar ao deletar post', async () => {
    PostModel.deletePost.mockRejectedValue(new Error('falha'));
    const req = { params: { id: 1 } };
    const res = mockResponse();

    await PostController.deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao deletar post.' });
  });
});
