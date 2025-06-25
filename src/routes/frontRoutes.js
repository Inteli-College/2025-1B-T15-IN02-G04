const express = require("express");
const path = require("path");
const checkAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/login", checkAuth, (req, res) => {
  res.render("pages/login", {
    title: "Login",
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
  });
});

module.exports = router;
