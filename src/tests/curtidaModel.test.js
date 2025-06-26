jest.mock('../config/db');
const db = require('../config/db');
const CurtidaModel = require('../models/curtidaModel');

describe('CurtidaModel', () => {
  afterEach(() => jest.clearAllMocks());

  describe('curtirPost', () => {
    it('deve inserir curtida', async () => {
      // Arrange
      db.query.mockResolvedValueOnce({});

      // Act
      const result = await CurtidaModel.curtirPost(1, 2);

      // Assert
      expect(result).toEqual({ message: 'Post curtido com sucesso' });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO post_likes'),
        [1, 2]
      );
    });

    it('deve lançar erro quando falhar', async () => {
      db.query.mockRejectedValue(new Error('DB fail'));
      await expect(CurtidaModel.curtirPost(1, 1)).rejects.toThrow('Erro ao curtir post');
    });
  });

  describe('descurtirPost', () => {
    it('deve remover curtida', async () => {
      db.query.mockResolvedValueOnce({});
      const result = await CurtidaModel.descurtirPost(1, 2);
      expect(result).toEqual({ message: 'Curtida removida com sucesso' });
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM post_likes'), [1, 2]);
    });
  });

  describe('contarCurtidas', () => {
    it('deve retornar total de curtidas', async () => {
      db.query.mockResolvedValue({ rows: [{ total: '5' }] });
      const total = await CurtidaModel.contarCurtidas(10);
      expect(total).toBe(5);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('COUNT(*)'), [10]);
    });
  });

  describe('verificarSeUsuarioCurtiu', () => {
    it('deve retornar true se usuário curtiu', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });
      const liked = await CurtidaModel.verificarSeUsuarioCurtiu(1, 2);
      expect(liked).toBe(true);
    });

    it('deve retornar false caso contrário', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });
      const liked = await CurtidaModel.verificarSeUsuarioCurtiu(1, 3);
      expect(liked).toBe(false);
    });
  });
}); 