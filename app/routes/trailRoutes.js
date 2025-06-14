const express = require('express');
const router = express.Router();
const TrailController = require('../controllers/trailController');

router.get('/trails', TrailController.getAllTrails);

router.get('/trails/:id', TrailController.getTrailById);

router.put('/trails/:id', TrailController.updateTrail);

router.post('/trails', TrailController.createTrail);

router.delete('/trails/:id', TrailController.deleteTrail);

module.exports = router;