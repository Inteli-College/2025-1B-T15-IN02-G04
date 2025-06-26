
const express = require('express');
const trailController = require('../controllers/trailController');

const router = express.Router();


router.get('/', trailController.getAllTrails);

router.get('/:id', trailController.getTrailById);

router.get('/name/:name', trailController.getTrailByName);

router.post('/', trailController.createTrail);

router.put('/:id', trailController.updateTrail);

router.delete('/:id', trailController.deleteTrail);

module.exports = router;