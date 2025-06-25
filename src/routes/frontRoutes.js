const express = require("express");
const path = require("path");
const checkAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/login", checkAuth, (req, res) => {
  res.render("pages/login", {
    pageTitle: 'Entrar',
    content: '../pages/login',
    pageCSS: 'pages/auth.css',
    pageJS: 'login.js',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

router.get("/dashboard", checkAuth, (req, res) => {
  res.render("pages/gestorDashboard", {
    title: "Dashboard",
  });
});

router.get("/perfil/:id", checkAuth, (req, res) => {
  res.render("pages/perfil", {
    title: "Perfil",
    userId: req.params.id,
  });
});

router.get('/trails', (req, res) => {
  res.render('pages/trails', {
    title: 'Trilhas de Aprendizado'
  })})
  
// Página inicial
router.get('/', (req, res) => {
    res.render('layout/main', {
      pageTitle: 'Transforme sua carreira no agronegócio',
      content: '../pages/home',
      pageCSS: 'pages/home.css',
      pageJS: 'home.js',
      currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
    });
  });

// Página de login
router.get('/login2', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Entrar',
    content: '../pages/login2',
    pageCSS: 'pages/auth.css',
    pageJS: 'login.js',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página dos cards
router.get('/cards', (req, res) => {
  res.render('pages/cards', {
    pageTitle: 'Cards',
    content: '../pages/cards',
    pageCSS: 'pages/cards.css',
    pageJS: 'cards.js',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Dashboard (página protegida)
router.get('/dashboard2', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Dashboard',
    content: '../pages/dashboard',
    pageCSS: 'pages/dashboard.css',
    pageJS: 'dashboard.js',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página sobre
router.get('/sobre', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Sobre Nós',
    content: '../pages/about',
    pageCSS: null, // Usar apenas estilos globais
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de cursos
router.get('/cursos', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Cursos',
    content: '../pages/courses',
    pageCSS: ['pages/home.css'], // Reutilizar estilos da home para cards de curso
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de contato
router.get('/contato', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Contato',
    content: '../pages/contact',
    pageCSS: 'pages/auth.css', // Reutilizar estilos de formulário
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Páginas de termos e privacidade
router.get('/termos', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Termos de Uso',
    content: '../pages/terms',
    pageCSS: null, // Apenas estilos globais
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

router.get('/privacidade', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Política de Privacidade',
    content: '../pages/privacy',
    pageCSS: null, // Apenas estilos globais
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de recuperação de senha
router.get('/esqueci-senha', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Recuperar Senha',
    content: '../pages/forgot-password',
    pageCSS: 'pages/auth.css',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de Trilhas/módulos
router.get('/Trilhas', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Trilhas',
    content: '../pages/trail',
    pageCSS: 'pages/trail.css',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

// Página de Aulas
router.get('/Aulas', (req, res) => {
  res.render('layout/main', {
    pageTitle: 'Aulas',
    content: '../pages/class',
    pageCSS: 'pages/class.css',
    currentUrl: req.protocol + '://' + req.get('host') + req.originalUrl
  });
});

module.exports = router;