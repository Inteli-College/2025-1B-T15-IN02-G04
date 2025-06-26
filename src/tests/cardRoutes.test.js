const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// mocks antes dos requires das rotas
jest.mock('../models/cardModel');
jest.mock('../middlewares/authApiMiddleware', () => (req, _res, next) => {
  req.userId = 1; // simula usuário autenticado
  next();
});
jest.mock('../middlewares/adminMiddleware', () => (_req, _res, next) => next());

const CardModel = require('../models/cardModel');
const cardRoutes = require('../routes/cardRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/', cardRoutes);

describe('Rotas /cards', () => {
  afterEach(() => jest.clearAllMocks());

  describe('GET /cards', () => {
    it('deve listar todos os cards', async () => {
      const mockCards = [{ id: 1 }];
      CardModel.getAllCards.mockResolvedValue(mockCards);

      const { status, body } = await request(app).get('/cards');
      expect(status).toBe(200);
      expect(body).toEqual(mockCards);
    });

    it('deve retornar 500 em erro', async () => {
      CardModel.getAllCards.mockRejectedValue(new Error('fail'));
      const { status } = await request(app).get('/cards');
      expect(status).toBe(500);
    });
  });

  describe('GET /cards/:id', () => {
    it('deve retornar card específico', async () => {
      const card = { id: 2 };
      CardModel.getCardById.mockResolvedValue(card);
      const { status, body } = await request(app).get('/cards/2');
      expect(status).toBe(200);
      expect(body).toEqual(card);
    });

    it('deve retornar 404 se não encontrar', async () => {
      CardModel.getCardById.mockResolvedValue(undefined);
      const { status } = await request(app).get('/cards/999');
      expect(status).toBe(404);
    });
  });

  describe('POST /cards/:cardId/favorite', () => {
    it('deve favoritar card', async () => {
      CardModel.favoriteCard.mockResolvedValue({ id_user: 1, id_card: 5 });
      const { status, body } = await request(app).post('/cards/5/favorite');
      expect(status).toBe(200);
      expect(body.message).toBe('Card favoritado com sucesso');
    });
  });

  describe('DELETE /cards/:cardId/favorite', () => {
    it('deve desfavoritar card', async () => {
      CardModel.unfavoriteCard.mockResolvedValue(true);
      const { status, body } = await request(app).delete('/cards/5/favorite');
      expect(status).toBe(200);
      expect(body.message).toBe('Card removido dos favoritos');
    });
  });
}); 