const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/tests', testController.getAllTests);
router.get('/tests/:id', testController.getTestById);
router.post('/tests', testController.createTest);
router.put('/tests/:id', testController.updateTest);
router.delete('/tests/:id', testController.deleteTest);

module.exports = router;