const LikeModel = require('../models/likeModel');

const LikeController = {
  async createLike(req, res) {
    try {
      const newLike = await LikeModel.createLike(req.body);
      return res.status(201).json(newLike);
    } catch (error) {
      console.error('Erro ao criar like:', error);
      return res.status(500).json({ error: 'Erro ao criar like.' });
    }
  },

  async deleteLike(req, res) {
    try {
      const { id } = req.params;
      const deleted = await LikeModel.deleteLike(id);
      if (deleted) {
        return res.status(200).json({ message: 'Like removido com sucesso' });
      }
      return res.status(404).json({ error: 'Like não encontrado' });
    } catch (error) {
      console.error('Erro ao deletar like:', error);
      return res.status(500).json({ error: 'Erro ao deletar like.' });
    }
  },

  async getLikesByPost(req, res) {
    try {
      const { postId } = req.params;
      const likes = await LikeModel.getLikesByPost(postId);
      return res.status(200).json(likes);
    } catch (error) {
      console.error('Erro ao buscar likes do post:', error);
      return res.status(500).json({ error: 'Erro ao buscar likes do post.' });
    }
  },

  async getLikesByUser(req, res) {
    try {
      const { userId } = req.params;
      const likes = await LikeModel.getLikesByUser(userId);
      return res.status(200).json(likes);
    } catch (error) {
      console.error('Erro ao buscar likes do usuário:', error);
      return res.status(500).json({ error: 'Erro ao buscar likes do usuário.' });
    }
  },

  async getLikeCount(req, res) {
    try {
      const { postId } = req.params;
      const count = await LikeModel.getLikeCount(postId);
      return res.status(200).json({ count });
    } catch (error) {
      console.error('Erro ao contar likes:', error);
      return res.status(500).json({ error: 'Erro ao contar likes.' });
    }
  },

  async toggleLike(req, res) {
    try {
      const { userId, postId } = req.body;
      const result = await LikeModel.toggleLike(userId, postId);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao alternar like:', error);
      return res.status(500).json({ error: 'Erro ao alternar like.' });
    }
  }
};

module.exports = LikeController; 