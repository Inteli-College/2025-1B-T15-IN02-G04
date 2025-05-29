const express = require('express');
const router = express.Router();
const path = require('path');

// Página inicial
router.get('/', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Transforme sua carreira no agronegócio',
    content: '../pages/home',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de login
router.get('/login', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Entrar',
    content: '../pages/login',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de registro
router.get('/register', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Criar Conta',
    content: '../pages/register',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página sobre
router.get('/sobre', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Sobre Nós',
    content: '../pages/about',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de cursos (placeholder)
router.get('/cursos', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Cursos',
    content: '../pages/courses',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de contato (placeholder)
router.get('/contato', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Contato',
    content: '../pages/contact',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Dashboard (página protegida - placeholder)
router.get('/dashboard', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Dashboard',
    content: '../pages/dashboard',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Páginas de termos e privacidade
router.get('/termos', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Termos de Uso',
    content: '../pages/terms',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

router.get('/privacidade', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Política de Privacidade',
    content: '../pages/privacy',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de recuperação de senha
router.get('/esqueci-senha', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Recuperar Senha',
    content: '../pages/forgot-password',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Adicione outras rotas conforme necessário

module.exports = router;
