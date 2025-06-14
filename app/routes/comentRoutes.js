const express = require('express');
const router = express.Router();
const ComentController = require('../controllers/comentController');

router.get('/coments', ComentController.getAllComents);

router.get('/coments/:id', ComentController.getComentById);

router.put('/coments/:id', ComentController.updateComent);

router.post('/coments', ComentController.createComent);

router.delete('/coments/:id', ComentController.deleteComent);

module.exports = router;