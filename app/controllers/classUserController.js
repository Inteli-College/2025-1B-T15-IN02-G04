const classUserModel = require('../models/classUserModel');

module.exports = {
  async list(req, res) {
    const classUser = await classUserModel.getAll();
    res.render('classUser/list', { classUser });
  },

  async create(req, res) {
    const { id_user, id_class } = req.body;
    await classUserModel.create({ id_user, id_class });
    res.redirect('/class-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await classUserModel.delete(id);
    res.redirect('/class-user');
  }
};