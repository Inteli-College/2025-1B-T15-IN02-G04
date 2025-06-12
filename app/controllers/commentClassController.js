const commentClassModel = require('../models/commentClassModel');

module.exports = {
  async list(req, res) {
    const commentClass = await commentClassModel.getAll();
    res.render('commentClass/list', { commentClass });
  },

  async create(req, res) {
    const { id_comment, id_class } = req.body;
    await commentClassModel.create({ id_comment, id_class });
    res.redirect('/comment-class');
  },

  async delete(req, res) {
    const { id } = req.params;
    await commentClassModel.delete(id);
    res.redirect('/comment-class');
  }
};