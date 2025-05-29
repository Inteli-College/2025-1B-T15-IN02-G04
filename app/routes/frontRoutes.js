const express = require('express');
const router = express.Router();
const path = require('path');

// Roteamento para páginas dinâmicas
router.get('/login', (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Login',
    content: path.join(__dirname, '../views/pages/login')
  });
});

router.get('/register', (req, res) => {
  res.render(path.join(__dirname, '../views/layout/main'), {
    pageTitle: 'Register',
    content: path.join(__dirname, '../views/pages/register')
  });
});

module.exports = router;
