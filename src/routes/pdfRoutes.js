const express = require('express');
const router = express.Router();
const PDFController = require('../controllers/pdfController');

// Rota para gerar PDF do card
router.get('/cards/:cardId/pdf', PDFController.generateCardPDF);

// Rota alternativa para arquivo texto simples (fallback)
router.get('/cards/:cardId/download', PDFController.generateSimpleCardPDF);

module.exports = router;