const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/cards', cardController.getAllCards);

router.get('/cards/:id', cardController.getCardById);

router.put('/cards/:id', cardController.updateCard);

router.post('/cards', cardController.createCard);

router.delete('/cards/:id', cardController.deleteCard);

module.exports = router;