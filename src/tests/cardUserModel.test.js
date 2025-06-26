jest.mock('../config/db');
const db = require('../config/db');
const CardUserModel = require('../models/cardUserModel');

describe('CardUserModel', () => {
  let model;
  beforeEach(() => {
    model = new CardUserModel();
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('deve retornar todos os relacionamentos', async () => {
      const rows = [{ id: 1 }];
      db.query.mockResolvedValue({ rows });
      const result = await model.getAll();
      expect(result).toEqual(rows);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM card_user');
    });
  });

  describe('create', () => {
    it('deve criar relacionamento', async () => {
      const payload = { id_user: 1, id_card: 2 };
      db.query.mockResolvedValue({ rows: [{ id: 5, ...payload }] });
      const result = await model.create(payload);
      expect(result).toEqual({ id: 5, ...payload });
      expect(db.query).toHaveBeenCalledWith('INSERT INTO card_user (id_user, id_card) VALUES ($1, $2) RETURNING *', [payload.id_user, payload.id_card]);
    });
  });

  describe('deleteByUserAndCard', () => {
    it('deve deletar relacionamento específico', async () => {
      const returned = { id: 4 };
      db.query.mockResolvedValue({ rows: [returned] });
      const result = await model.deleteByUserAndCard(1, 2);
      expect(result).toEqual(returned);
      expect(db.query).toHaveBeenCalledWith('DELETE FROM card_user WHERE id_user = $1 AND id_card = $2 RETURNING *', [1, 2]);
    });
  });
}); 