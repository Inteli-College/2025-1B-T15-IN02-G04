const userLikeModel = require('../models/trailUserModel');

module.exports = {
  async list(req, res) {
    const userLike = await userLikeModel.getAll();
    res.render('userLike/list', { userLike });
  },

  async create(req, res) {
    const { id_user, id_like } = req.body;
    await userLikeModel.create({ id_user, id_like });
    res.redirect('/like-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await userLikeModel.delete(id);
    res.redirect('/like-user');
  }
};