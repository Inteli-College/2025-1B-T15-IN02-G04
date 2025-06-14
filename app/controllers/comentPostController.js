const comentPostModel = require('../models/comentPostModel');

module.exports = {
  async list(req, res) {
    const comentPost = await comentPostModel.getAll();
    res.render('comentPost/list', { comentPost });
  },

  async create(req, res) {
    const { id_coment, id_post } = req.body;
    await comentPostModel.create({ id_coment, id_post });
    res.redirect('/coment-post');
  },

  async delete(req, res) {
    const { id } = req.params;
    await comentPostModel.delete(id);
    res.redirect('/coment-post');
  }
};