const userCardModel = require('../models/userCardModel');

module.exports = {
  async list(req, res) {
    const userCards = await userCardModel.getAll();
    res.render('userCards/list', { userCards });
  },

  async create(req, res) {
    const { id_user, id_card } = req.body;
    await userCardModel.create({ id_user, id_card });
    res.redirect('/user-cards');
  },

  async delete(req, res) {
    const { id } = req.params;
    await userCardModel.delete(id);
    res.redirect('/user-cards');
  }
};