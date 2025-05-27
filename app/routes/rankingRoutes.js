const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

router.get('/', rankingController.getAllRankings);
router.get('/:id', rankingController.getRankingById);
router.post('/', rankingController.createRanking);
router.put('/:id', rankingController.updateRanking);
router.delete('/:id', rankingController.deleteRanking);

module.exports = router;
