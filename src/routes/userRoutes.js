const express = require("express");
const userController = require("../controllers/userController");
const checkAuth = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", checkAuth, userController.meuPerfil);
router.get("/ranking", userController.listarRanking);
router.get("/:id", userController.obterUsuario);

module.exports = router;
