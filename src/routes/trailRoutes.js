const express = require('express');
const router = express.Router();
const trailController = require('../controllers/trailController');

router.get('/', trailController.getAllTrails);

router.get('/name/:name', trailController.getTrailByName);

router.get('/:id', trailController.getTrailById);

router.post('/', trailController.createTrail);

router.put('/:id', trailController.updateTrail);

router.delete('/:id', trailController.deleteTrail);

module.exports = router;