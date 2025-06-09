const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

// Rotas de likes
router.post('/likes', likeController.createLike);
router.delete('/likes/:id', likeController.deleteLike);
router.get('/likes/post/:postId', likeController.getLikesByPost);
router.get('/likes/user/:userId', likeController.getLikesByUser);
router.get('/likes/count/:postId', likeController.getLikeCount);

module.exports = router; 