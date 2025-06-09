const testUserModel = require('../models/testUserModel');

module.exports = {
  async list(req, res) {
    const testUser = await testUserModel.getAll();
    res.render('testUser/list', { testUser });
  },

  async create(req, res) {
    const { id_user, id_card } = req.body;
    await testUserModel.create({ id_user, id_card });
    res.redirect('/user-cards');
  },

  async delete(req, res) {
    const { id } = req.params;
    await testUserModel.delete(id);
    res.redirect('/user-cards');
  }
};