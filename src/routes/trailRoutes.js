const express = require('express');
const trailController = require('../controllers/trailController');

const router = express.Router();


router.get('/trails', trailController.getAllTrails);

router.get('/trails/:id', trailController.getTrailById);

router.get('/trails/name/:name', trailController.getTrailByName);

router.post('/trails', trailController.createTrail);

router.put('/trails/:id', trailController.updateTrail);

router.delete('/trails/:id', trailController.deleteTrail);

module.exports = router;