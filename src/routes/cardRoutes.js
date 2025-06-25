const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const checkApiAuth = require('../middlewares/authApiMiddleware');
const checkAdminAuth = require('../middlewares/adminMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/cards/search', cardController.searchCards);
router.get('/cards', cardController.getAllCards);
router.get('/cards/:id', cardController.getCardById);

// Rotas protegidas (precisam de autenticação)
router.post('/cards/:cardId/favorite', checkApiAuth, cardController.favoriteCard);
router.delete('/cards/:cardId/favorite', checkApiAuth, cardController.unfavoriteCard);
router.get('/cards/:cardId/check-favorite', checkApiAuth, cardController.checkIfFavorited);
router.get('/favorites', checkApiAuth, cardController.getUserFavorites);

// Rotas administrativas (CRUD) - Apenas para admins (role_id = 1)
router.put('/cards/:id', checkApiAuth, checkAdminAuth, cardController.updateCard);
router.post('/cards', checkApiAuth, checkAdminAuth, cardController.createCard);
router.delete('/cards/:id', checkApiAuth, checkAdminAuth, cardController.deleteCard);

module.exports = router;