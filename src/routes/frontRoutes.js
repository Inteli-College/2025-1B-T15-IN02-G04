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
  res.send("Você está na dashboard");
});

module.exports = router;
