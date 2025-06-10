const moduleUserModel = require('../models/moduleUserModel');

module.exports = {
  async list(req, res) {
    const moduleUser = await moduleUserModel.getAll();
    res.render('moduleUser/list', { moduleUser });
  },

  async create(req, res) {
    const { id_user, id_module } = req.body;
    await moduleUserModel.create({ id_user, id_module });
    res.redirect('/module-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await moduleUserModel.delete(id);
    res.redirect('/module-user');
  }
};