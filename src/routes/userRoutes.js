const express = require("express");
const userController = require("../controllers/userController");
// const checkAuth = require("../middlewares/authMiddleware");
const checkApiAuth = require("../middlewares/authApiMiddleware");

const router = express.Router();

router.get("/me", checkApiAuth, userController.meuPerfil);
router.get("/ranking", userController.listarRanking);
router.get("/:id", userController.obterUsuario);

module.exports = router;
