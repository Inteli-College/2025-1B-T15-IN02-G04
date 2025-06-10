const roleUserModel = require('../models/roleUserModel');

module.exports = {
  async list(req, res) {
    const roleUser = await roleUserModel.getAll();
    res.render('roleUser/list', { roleUser });
  },

  async create(req, res) {
    const { id_user, id_role } = req.body;
    await roleUserModel.create({ id_user, id_role });
    res.redirect('/role-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await roleUserModel.delete(id);
    res.redirect('/role-user');
  }
};