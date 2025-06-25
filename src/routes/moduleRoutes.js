const express = require('express');
const moduleController = require('../controllers/moduleController');

const router = express.Router();

router.get('/modules', moduleController.getAllModules);
router.get('/modules/:id', moduleController.getModuleById);
router.get('/modules/name/:name', moduleController.getModuleByName);
router.post('/modules', moduleController.createModule);
router.put('/modules/:id', moduleController.updateModule);
router.delete('/modules/:id', moduleController.deleteModule);

module.exports = router;