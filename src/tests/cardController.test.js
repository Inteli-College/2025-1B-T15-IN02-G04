jest.mock('../models/cardModel');
const CardModel = require('../models/cardModel');
const CardController = require('../controllers/cardController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CardController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getAllCards', () => {
    it('deve retornar 200 e lista', async () => {
      const req = {};
      const res = buildRes();
      const list = [{ id: 1 }];
      CardModel.getAllCards.mockResolvedValue(list);
      await CardController.getAllCards(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(list);
    });

    it('deve retornar 500 em erro', async () => {
      const req = {};
      const res = buildRes();
      CardModel.getAllCards.mockRejectedValue(new Error('x'));
      await CardController.getAllCards(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCardById', () => {
    it('retorna 404 se não encontrar', async () => {
      const req = { params: { id: 9 } };
      const res = buildRes();
      CardModel.getCardById.mockResolvedValue(undefined);
      await CardController.getCardById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('favoriteCard', () => {
    it('retorna 401 se sem userId', async () => {
      const req = { params: { cardId: 1 } };
      const res = buildRes();
      await CardController.favoriteCard(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('retorna 200 sucesso', async () => {
      const req = { params: { cardId: 2 }, userId: 1 };
      const res = buildRes();
      CardModel.favoriteCard.mockResolvedValue({});
      await CardController.favoriteCard(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
}); 