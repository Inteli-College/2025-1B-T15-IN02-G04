const commentPostModel = require('../models/commentPostModel');

module.exports = {
  async list(req, res) {
    const commentPost = await commentPostModel.getAll();
    res.render('commentPost/list', { commentPost });
  },

  async create(req, res) {
    const { id_comment, id_post } = req.body;
    await commentPostModel.create({ id_comment, id_post });
    res.redirect('/comment-post');
  },

  async delete(req, res) {
    const { id } = req.params;
    await commentPostModel.delete(id);
    res.redirect('/comment-post');
  }
};