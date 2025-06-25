jest.mock('../config/db');
const db = require('../config/db');
const CardModel = require('../models/cardModel');

describe('CardModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /* GETs                                                                       */
  /* -------------------------------------------------------------------------- */
  describe('getAllCards', () => {
    it('deve retornar todos os cards', async () => {
      // Arrange
      const mockRows = [{ id: 1 }, { id: 2 }];
      db.query.mockResolvedValue({ rows: mockRows });

      // Act
      const result = await CardModel.getAllCards();

      // Assert
      expect(result).toEqual(mockRows);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM card ORDER BY created_at DESC');
    });

    it('deve lançar erro quando a consulta falhar', async () => {
      // Arrange
      db.query.mockRejectedValue(new Error('Falha DB'));

      // Act / Assert
      await expect(CardModel.getAllCards()).rejects.toThrow('Falha DB');
    });
  });

  describe('getCardById', () => {
    it('deve retornar um card pelo id', async () => {
      // Arrange
      const mockCard = { id: 1, title: 'A' };
      db.query.mockResolvedValue({ rows: [mockCard] });

      // Act
      const result = await CardModel.getCardById(1);

      // Assert
      expect(result).toEqual(mockCard);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM card WHERE id = $1', [1]);
    });

    it('deve propagar erro', async () => {
      db.query.mockRejectedValue(new Error('fail'));
      await expect(CardModel.getCardById(1)).rejects.toThrow('fail');
    });
  });

  describe('createCard', () => {
    it('deve criar um novo card', async () => {
      // Arrange
      const payload = { title: 'T', description: 'D', image: 'img.png' };
      db.query.mockResolvedValue({ rows: [{ id: 1, ...payload }] });

      // Act
      const result = await CardModel.createCard(payload);

      // Assert
      expect(result).toEqual({ id: 1, ...payload });
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO card (title, description, image) VALUES ($1, $2, $3) RETURNING *',
        [payload.title, payload.description, payload.image]
      );
    });
  });

  describe('updateCard', () => {
    it('deve atualizar card', async () => {
      // Arrange
      const updated = { id: 1, title: 'Novo', description: 'Desc', image: 'i.png' };
      db.query.mockResolvedValue({ rows: [updated] });

      // Act
      const result = await CardModel.updateCard(updated.id, updated.title, updated.description, updated.image);

      // Assert
      expect(result).toEqual(updated);
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE card SET title = $1, description = $2, image = $3 WHERE id = $4 RETURNING *',
        [updated.title, updated.description, updated.image, updated.id]
      );
    });
  });

  describe('deleteCard', () => {
    it('deve retornar true quando deletar', async () => {
      // Arrange
      db.query.mockResolvedValue({ rowCount: 1 });

      // Act
      const result = await CardModel.deleteCard(1);

      // Assert
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM card WHERE id = $1 RETURNING *', [1]);
    });

    it('deve retornar false quando nenhum registro for afetado', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });
      const result = await CardModel.deleteCard(1);
      expect(result).toBe(false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Favoritar / Desfavoritar                                                   */
  /* -------------------------------------------------------------------------- */
  describe('favoriteCard', () => {
    it('deve inserir relacionamento se ainda não existir', async () => {
      // Arrange
      const userId = 10;
      const cardId = 5;
      db.query
        .mockResolvedValueOnce({ rows: [] }) // primeira verificação retorna vazio
        .mockResolvedValueOnce({ rows: [{ id_user: userId, id_card: cardId }] }) // insert
        .mockResolvedValueOnce({}); // update fav

      // Act
      const result = await CardModel.favoriteCard(userId, cardId);

      // Assert
      expect(result).toEqual({ id_user: userId, id_card: cardId });
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('deve apenas retornar registro quando já existir relacionamento', async () => {
      // Arrange
      const existing = { id_user: 1, id_card: 2 };
      db.query.mockResolvedValue({ rows: [existing] });

      // Act
      const result = await CardModel.favoriteCard(existing.id_user, existing.id_card);

      // Assert
      expect(result).toEqual(existing);
      expect(db.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('unfavoriteCard', () => {
    it('deve desfavoritar card e atualizar flag se for o último', async () => {
      // Arrange
      const userId = 1;
      const cardId = 2;
      db.query
        .mockResolvedValueOnce({ rowCount: 1 }) // delete relacionamento
        .mockResolvedValueOnce({ rows: [{ count: '0' }] }) // nenhum outro usuário
        .mockResolvedValueOnce({}); // update card fav = false

      // Act
      const result = await CardModel.unfavoriteCard(userId, cardId);

      // Assert
      expect(result).toBe(true);
      expect(db.query).toHaveBeenCalledTimes(3);
    });

    it('deve retornar false quando nenhum relacionamento for removido', async () => {
      db.query
        .mockResolvedValueOnce({ rowCount: 0 }) // tentativa de delete não removeu linhas
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // ainda existe outro usuário

      const result = await CardModel.unfavoriteCard(1, 1);

      expect(result).toBe(false);
      expect(db.query).toHaveBeenCalledTimes(2);
    });
  });
}); 