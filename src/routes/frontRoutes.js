const express = require("express");
const path = require("path");
const checkAuth = require("../middlewares/authMiddleware");

const router = express.Router();

// Página de login
router.get("/login", (req, res) => {
  res.render("pages/login", {
    pageTitle: "Entrar",
    content: "../pages/login",
    pageCSS: "pages/auth.css",
    pageJS: "login.js",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Perfil
router.get("/perfil/:id", checkAuth, (req, res) => {
  res.render("pages/perfil", {
    title: "Perfil",
    userId: req.params.id, // perfil visualizado
    viewerId: req.userId, // quem está logado
  });
});

// Trilhas de aprendizado
router.get("/trails", (req, res) => {
  res.render("pages/trails", {
    title: "Trilhas de Aprendizado",
  });
});

// Página inicial
router.get("/", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Transforme sua carreira no agronegócio",
    content: "../pages/home",
    pageCSS: "pages/home.css",
    pageJS: "home.js",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de login alternativa
router.get("/login2", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Entrar",
    content: "../pages/login2",
    pageCSS: "pages/auth.css",
    pageJS: "login.js",
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de cards
router.get("/cards", checkAuth, (req, res) => {
  res.render("pages/cards", {
    pageTitle: "Cards",
    content: "../pages/cards",
    pageCSS: "pages/admin-cards.css",
    pageJS: "cards.js",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Dashboard alternativo
router.get("/dashboard2", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Dashboard",
    content: "../pages/dashboard",
    pageCSS: "pages/dashboard.css",
    pageJS: "dashboard.js",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página sobre
router.get("/sobre", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Sobre Nós",
    content: "../pages/about",
    pageCSS: null,
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de cursos
router.get("/cursos", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Cursos",
    content: "../pages/courses",
    pageCSS: ["pages/home.css"],
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de contato
router.get("/contato", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Contato",
    content: "../pages/contact",
    pageCSS: "pages/auth.css",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de termos
router.get("/termos", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Termos de Uso",
    content: "../pages/terms",
    pageCSS: null,
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de privacidade
router.get("/privacidade", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Política de Privacidade",
    content: "../pages/privacy",
    pageCSS: null,
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de recuperação de senha
router.get("/esqueci-senha", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Recuperar Senha",
    content: "../pages/forgot-password",
    pageCSS: "pages/auth.css",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de trilhas
router.get("/Trilhas", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Trilhas",
    content: "../pages/trail",
    pageCSS: "pages/trail.css",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de módulos
router.get("/Modulos", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Módulos",
    content: "../pages/modules",
    pageCSS: "pages/module.css",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de módulos
router.get("/admin/modulos", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Módulos de Aprendizagem",
    content: "../pages/admin-modules",
    pageCSS: "pages/admin-modules.css",
    pageJS: "modules.js",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de aulas
router.get("/Aulas", (req, res) => {
  res.render("layout/main", {
    pageTitle: "Aulas",
    content: "../pages/class",
    pageCSS: "pages/class.css",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de feed (adicionada da branch feat/adiciona=feed)
router.get("/feed", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Feed",
    content: "../pages/feed",
    userId: req.userId,
    currentUrl: req.protocol + "://" + req.get("host") + req.originalUrl,
  });
});

// Página de post individual
router.get("/post/:id", checkAuth, (req, res) => {
  res.render("layout/main", {
    pageTitle: "Post",
    content: "../pages/post",
    pageCSS: null,
    userId: req.userId,
    postId: req.params.id,
  });
});

module.exports = router;
