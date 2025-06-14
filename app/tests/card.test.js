const request = require('supertest');
const express = require('express');
const app = express();
const CardModel = require('../models/cardModel');

// Configure app for tests
app.use(express.json());

// Mock routes
app.get('/cards', async (req, res) => {
  try {
    const cards = await CardModel.getAllCards();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar cards.' });
  }
});

app.get('/cards/:id', async (req, res) => {
  try {
    const card = await CardModel.getCardById(req.params.id);
    if (card) {
      res.json(card);
    } else {
      res.status(404).json({ error: 'Card não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar card.' });
  }
});

app.post('/cards', async (req, res) => {
  try {
    const newCard = await CardModel.createCard(req.body);
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar card.' });
  }
});

app.put('/cards/:id', async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const updatedCard = await CardModel.updateCard(req.params.id, title, description, image);
    if (updatedCard) {
      res.json(updatedCard);
    } else {
      res.status(404).json({ error: 'Card não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar card.' });
  }
});

app.delete('/cards/:id', async (req, res) => {
  try {
    const result = await CardModel.deleteCard(req.params.id);
    if (result) {
      res.json({ message: 'Card deletado com sucesso.' });
    } else {
      res.status(404).json({ error: 'Card não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar card.' });
  }
});

jest.mock('../models/cardModel');

describe('API de Cards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /cards', () => {
    it('deve retornar todos os cards', async () => {
      const cardsMock = [
        { id: 1, title: 'Card 1', description: 'Desc 1', image: 'img1.jpg' },
        { id: 2, title: 'Card 2', description: 'Desc 2', image: 'img2.jpg' }
      ];

      CardModel.getAllCards.mockResolvedValue(cardsMock);

      const response = await request(app)
        .get('/cards')
        .expect(200);

      expect(response.body).toEqual(cardsMock);
      expect(CardModel.getAllCards).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erros ao listar cards', async () => {
      CardModel.getAllCards.mockRejectedValue(new Error('Erro no banco de dados'));

      const response = await request(app)
        .get('/cards')
        .expect(500);

      expect(response.body).toEqual({ error: 'Erro ao listar cards.' });
    });
  });

  describe('GET /cards/:id', () => {
    it('deve retornar um card específico', async () => {
      const cardMock = { id: 1, title: 'Card 1', description: 'Desc 1', image: 'img1.jpg' };
      CardModel.getCardById.mockResolvedValue(cardMock);

      const response = await request(app)
        .get('/cards/1')
        .expect(200);

      expect(response.body).toEqual(cardMock);
      expect(CardModel.getCardById).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 para card não encontrado', async () => {
      CardModel.getCardById.mockResolvedValue(null);

      const response = await request(app)
        .get('/cards/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Card não encontrado.' });
    });
  });

  describe('POST /cards', () => {
    it('deve criar um novo card', async () => {
      const novoCard = {
        title: 'Novo Card',
        description: 'Nova Descrição',
        image: 'nova-imagem.jpg'
      };

      const cardCriadoMock = { id: 1, ...novoCard };
      CardModel.createCard.mockResolvedValue(cardCriadoMock);

      const response = await request(app)
        .post('/cards')
        .send(novoCard)
        .expect(201);

      expect(response.body).toEqual(cardCriadoMock);
      expect(CardModel.createCard).toHaveBeenCalledWith(novoCard);
    });
  });

  describe('PUT /cards/:id', () => {
    it('deve atualizar um card existente', async () => {
      const cardAtualizado = {
        id: 1,
        title: 'Card Atualizado',
        description: 'Descrição Atualizada',
        image: 'imagem-atualizada.jpg'
      };

      CardModel.updateCard.mockResolvedValue(cardAtualizado);

      const response = await request(app)
        .put('/cards/1')
        .send(cardAtualizado)
        .expect(200);

      expect(response.body).toEqual(cardAtualizado);
      expect(CardModel.updateCard).toHaveBeenCalledWith('1', cardAtualizado.title, cardAtualizado.description, cardAtualizado.image);
    });
  });

  describe('DELETE /cards/:id', () => {
    it('deve deletar um card', async () => {
      CardModel.deleteCard.mockResolvedValue(true);

      const response = await request(app)
        .delete('/cards/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Card deletado com sucesso.' });
      expect(CardModel.deleteCard).toHaveBeenCalledWith('1');
    });

    it('deve retornar 404 para card não encontrado ao deletar', async () => {
      CardModel.deleteCard.mockResolvedValue(false);

      const response = await request(app)
        .delete('/cards/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Card não encontrado.' });
    });
  });
});