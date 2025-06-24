const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const checkApiAuth = require('../middlewares/authApiMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/cards/search', cardController.searchCards);
router.get('/cards', cardController.getAllCards);
router.get('/cards/:id', cardController.getCardById);

// Rotas protegidas (precisam de autenticação)
router.post('/cards/:cardId/favorite', checkApiAuth, cardController.favoriteCard);
router.delete('/cards/:cardId/favorite', checkApiAuth, cardController.unfavoriteCard);
router.get('/cards/:cardId/check-favorite', checkApiAuth, cardController.checkIfFavorited);
router.get('/favorites', checkApiAuth, cardController.getUserFavorites);

// Rotas administrativas (CRUD)
router.put('/cards/:id', cardController.updateCard);
router.post('/cards', cardController.createCard);
router.delete('/cards/:id', cardController.deleteCard);

module.exports = router;