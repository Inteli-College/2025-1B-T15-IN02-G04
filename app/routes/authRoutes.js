const express = require('express');
const { login, perfilProtegido } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/perfil', authMiddleware, perfilProtegido);

mpdule.exports = router;