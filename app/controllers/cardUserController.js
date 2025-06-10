const cardUserModel = require('../models/cardUserModel');

module.exports = {
  async list(req, res) {
    const cardUsers = await cardUserModel.getAll();
    res.render('cardUsers/list', { cardUsers });
  },

  async create(req, res) {
    const { id_user, id_card } = req.body;
    await cardUserModel.create({ id_user, id_card });
    res.redirect('/card-user');
  },

  async delete(req, res) {
    const { id } = req.params;
    await cardUserModel.delete(id);
    res.redirect('/card-user');
  }
};