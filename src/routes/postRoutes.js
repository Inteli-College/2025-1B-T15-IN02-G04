const express = require("express");
const PostController = require("../controllers/postController");
const ComentarioController = require("../controllers/comentarioController");
const CurtidaController = require("../controllers/curtidaController");
const checkAuth = require("../middlewares/authMiddleware");

const router = express.Router();

// ---------- ROTAS DE POSTS ----------
router.post("/", checkAuth, PostController.criar);
router.get("/", PostController.listar);
router.get("/:id", PostController.buscarPorId);
router.delete("/:id", checkAuth, PostController.deletar);

// ---------- ROTAS DE COMENTÁRIOS ----------
router.post("/:id_post/comentarios", checkAuth, ComentarioController.criar);
router.get("/:id_post/comentarios", ComentarioController.listarPorPost);
router.delete("/comentarios/:id", checkAuth, ComentarioController.deletar);

// ---------- ROTAS DE CURTIDAS ----------
router.post("/:id_post/curtir", checkAuth, CurtidaController.curtir);
router.delete("/:id_post/curtir", checkAuth, CurtidaController.descurtir);
router.get("/:id_post/curtidas", CurtidaController.contar);
router.get(
  "/:id_post/curtidas/verificar",
  checkAuth,
  CurtidaController.verificar
);

module.exports = router;
