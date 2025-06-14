const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { login, register, perfilProtegido } = require('../controllers/authController');

const router = express.Router();

router.get('/perfil', authMiddleware, perfilProtegido);
router.post('/register', register);
router.post('/login', login);

module.exports = router;