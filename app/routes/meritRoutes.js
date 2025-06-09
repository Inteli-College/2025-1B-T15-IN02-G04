const express = require('express');
const router = express.Router();
const MeritController = require('../controllers/meritController');

router.get('/merits', MeritController.getAllMerits);

router.get('/merits/:id', MeritController.getMeritById);

router.put('/merits/:id', MeritController.updateMerit);

router.post('/merits', MeritController.createMerit);

router.delete('/merits/:id', MeritController.deleteMerit);

module.exports = router;