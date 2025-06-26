const express = require("express");
const trailController = require("../controllers/trailController");

const router = express.Router();

console.log("🔧 DEBUG: Configurando rotas de trilhas...");

// Rota para listar todas as trilhas
router.get("/", (req, res, next) => {
  console.log("📡 GET /api/trails chamado");
  trailController.getAllTrails(req, res, next);
});

// Rota para buscar trilha por ID
router.get("/:id", (req, res, next) => {
  console.log("📡 GET /api/trails/:id chamado com ID:", req.params.id);
  trailController.getTrailById(req, res, next);
});

// Rota para buscar trilha por nome
router.get("/name/:name", trailController.getTrailByName);

// Rota para criar trilha
router.post("/", trailController.createTrail);

// Rota para atualizar trilha
router.put("/:id", trailController.updateTrail);

// Rota para deletar trilha
router.delete("/:id", trailController.deleteTrail);

console.log("✅ Rotas de trilhas configuradas");

module.exports = router;
