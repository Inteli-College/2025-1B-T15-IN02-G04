const comentClassModel = require('../models/comentClassModel');

module.exports = {
  async list(req, res) {
    const comentClass = await comentClassModel.getAll();
    res.render('comentClass/list', { comentClass });
  },

  async create(req, res) {
    const { id_coment, id_class } = req.body;
    await comentClassModel.create({ id_coment, id_class });
    res.redirect('/coment-class');
  },

  async delete(req, res) {
    const { id } = req.params;
    await comentClassModel.delete(id);
    res.redirect('/coment-class');
  }
};