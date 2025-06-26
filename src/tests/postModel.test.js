jest.mock('../config/db');
const db = require('../config/db');
const PostModel = require('../models/postModel');

describe('PostModel', () => {
  afterEach(() => jest.clearAllMocks());

  describe('criarPost', () => {
    it('deve criar post', async () => {
      const payload = { id_user: 1, titulo: 'Titulo', descricao: 'Desc', imagem: 'img.png' };
      db.query.mockResolvedValue({ rows: [{ id_post: 1, ...payload }] });
      const result = await PostModel.criarPost(payload);
      expect(result).toEqual({ id_post: 1, ...payload });
      expect(db.query).toHaveBeenCalled();
    });
  });

  describe('listarTodos', () => {
    it('deve listar posts', async () => {
      const rows = [{ id_post: 1, titulo: 'T', autor: 'User' }];
      db.query.mockResolvedValue({ rows });
      const result = await PostModel.listarTodos();
      expect(result).toEqual(rows);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT p.id_post'));
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar por id', async () => {
      const row = { id_post: 2, titulo: 'x' };
      db.query.mockResolvedValue({ rows: [row] });
      const result = await PostModel.buscarPorId(2);
      expect(result).toEqual(row);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id_post = $1'), [2]);
    });
  });

  describe('deletarPost', () => {
    it('deve deletar post', async () => {
      db.query.mockResolvedValue({});
      const result = await PostModel.deletarPost(3);
      expect(result).toEqual({ message: 'Post deletado com sucesso' });
      expect(db.query).toHaveBeenCalledWith('DELETE FROM post WHERE id_post = $1', [3]);
    });
  });
}); 