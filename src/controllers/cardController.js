const CardModel = require('../models/cardModel');

class CardController {
  static async getAllCards(req, res) {
    try {
      const cards = await CardModel.getAllCards();
      return res.status(200).json(cards);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar cards.' });
    }
  }

  static async getCardById(req, res) {
    try {
      const { id } = req.params;
      const card = await CardModel.getCardById(id);
      if (!card) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }
      return res.status(200).json(card);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter card.' });
    }
  }

  static async getCardByTitle(req, res) {
    try {
      const { title } = req.params;
      const cards = await CardModel.getCardByTitle(title);
      return res.status(200).json(cards);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao obter cards.' });
    }
  }

  static async searchCards(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim() === '') {
        const cards = await CardModel.getAllCards();
        return res.status(200).json(cards);
      }
      const cards = await CardModel.searchCards(q);
      return res.status(200).json(cards);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao pesquisar cards.' });
    }
  }

  static async createCard(req, res) {
    try {
      const newCard = await CardModel.createCard(req.body);
      return res.status(201).json(newCard);
    } catch (err) {
      console.error('Erro ao criar card:', err); 
      res.status(500).json({ error: 'Erro ao criar card' });
    }
  }

  static async updateCard(req, res) {
    try {
      const { title, description, image } = req.body;
      console.log("REQ.BODY:", req.body);          
      console.log("TITLE:", title);                   
      console.log("DESCRIPTION:", description);      
      console.log("IMAGE:", image);
      const updatedCard = await CardModel.updateCard(req.params.id, title, description, image);
      if (updatedCard) {
        res.status(200).json(updatedCard);
      } else {
        res.status(404).json({ error: 'Card não encontrado' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCard(req, res) {
    try {
      const id = parseInt(req.params.id);
      const cardDeleted = await CardModel.deleteCard(id);
      if (cardDeleted) {
        return res.status(200).json({ message: 'Card deletado com sucesso' });
      } else {
        return res.status(404).json({ error: 'Card não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao deletar card:', err);
      res.status(500).json({ error: 'Erro ao deletar card' });
    }
  }

  static async favoriteCard(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.userId; // Vem do middleware de autenticação

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const result = await CardModel.favoriteCard(userId, cardId);
      return res.status(200).json({ 
        message: 'Card favoritado com sucesso',
        favorite: result
      });
    } catch (err) {
      console.error('Erro ao favoritar card:', err);
      res.status(500).json({ error: 'Erro ao favoritar card' });
    }
  }

  static async unfavoriteCard(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.userId; // Vem do middleware de autenticação

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const result = await CardModel.unfavoriteCard(userId, cardId);
      if (result) {
        return res.status(200).json({ message: 'Card removido dos favoritos' });
      } else {
        return res.status(404).json({ error: 'Favorito não encontrado' });
      }
    } catch (err) {
      console.error('Erro ao desfavoritar card:', err);
      res.status(500).json({ error: 'Erro ao desfavoritar card' });
    }
  }

  static async getUserFavorites(req, res) {
    try {
      const userId = req.userId; // Vem do middleware de autenticação

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const favoriteCards = await CardModel.getUserFavoriteCards(userId);
      return res.status(200).json(favoriteCards);
    } catch (err) {
      console.error('Erro ao buscar favoritos:', err);
      res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
  }

  static async checkIfFavorited(req, res) {
    try {
      const { cardId } = req.params;
      const userId = req.userId; // Vem do middleware de autenticação

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const isFavorited = await CardModel.isCardFavoritedByUser(userId, cardId);
      return res.status(200).json({ isFavorited });
    } catch (err) {
      console.error('Erro ao verificar favorito:', err);
      res.status(500).json({ error: 'Erro ao verificar favorito' });
    }
  }
}

module.exports = CardController;