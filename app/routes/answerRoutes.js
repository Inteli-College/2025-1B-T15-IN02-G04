const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

router.get('/answers', answerController.getAllAnswers);
router.get('/answers/:id', answerController.getAnswerById);
router.post('/answers', answerController.createAnswer);
router.put('/answers/:id', answerController.updateAnswer);
router.delete('/answers/:id', answerController.deleteAnswer);

module.exports = router;