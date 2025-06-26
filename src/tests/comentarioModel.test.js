jest.mock('../config/db');
const db = require('../config/db');
const ComentarioModel = require('../models/comentarioModel');

describe('ComentarioModel', () => {
  afterEach(() => jest.clearAllMocks());

  describe('criarComentario', () => {
    it('deve inserir comentário', async () => {
      const payload = { id_post: 1, id_user: 2, comment_text: 'Olá' };
      db.query.mockResolvedValue({ rows: [{ id: 5, ...payload }] });

      const result = await ComentarioModel.criarComentario(payload);

      expect(result).toEqual({ id: 5, ...payload });
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO comment'), [payload.id_post, payload.id_user, payload.comment_text]);
    });
  });

  describe('listarPorPost', () => {
    it('deve listar comentários do post', async () => {
      const rows = [{ id: 1, comment_text: 'Oi', autor: 'User' }];
      db.query.mockResolvedValue({ rows });
      const result = await ComentarioModel.listarPorPost(1);
      expect(result).toEqual(rows);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM comment'), [1]);
    });
  });

  describe('deletarComentario', () => {
    it('deve deletar comentário', async () => {
      db.query.mockResolvedValue({});
      const result = await ComentarioModel.deletarComentario(9);
      expect(result).toEqual({ message: 'Comentário deletado com sucesso' });
      expect(db.query).toHaveBeenCalledWith('DELETE FROM comment WHERE id = $1', [9]);
    });
  });
}); 