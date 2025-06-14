const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");

router.get("/ranking", rankingController.getAllRankings);
router.get("/ranking/:id", rankingController.getRankingById);
router.post("/ranking", rankingController.createRanking);
router.put("/ranking/:id", rankingController.updateRanking);
router.delete("/ranking/:id", rankingController.deleteRanking);

module.exports = router;
