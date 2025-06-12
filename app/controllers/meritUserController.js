const meritUserModel = require('../models/meritUserModel');

module.exports = {
  async list(req, res) {
    const meritUser = await meritUserModel.getAll();
    res.render('meritUser/list', { meritUser });
  },

  async create(req, res) {
    const { id_user, id_merit } = req.body;
    await meritUserModel.create({ id_user, id_merit });
    res.redirect('/merit-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await meritUserModel.delete(id);
    res.redirect('/merit-user');
  }
};