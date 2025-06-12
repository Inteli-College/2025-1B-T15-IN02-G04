const trailUserModel = require('../models/trailUserModel');

module.exports = {
  async list(req, res) {
    const trailUser = await trailUserModel.getAll();
    res.render('trailUser/list', { trailUser });
  },

  async create(req, res) {
    const { id_user, id_trail } = req.body;
    await trailUserModel.create({ id_user, id_trail });
    res.redirect('/trail-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await trailUserModel.delete(id);
    res.redirect('/trail-user');
  }
};