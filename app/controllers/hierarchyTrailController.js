const hierarchyTrailModel = require('../models/hierarchyTrailModel');

module.exports = {
  async list(req, res) {
    const hierarchyTrail = await hierarchyTrailModel.getAll();
    res.render('hierarchyTrail/list', { hierarchyTrail });
  },

  async create(req, res) {
    const { id_hierarchy, id_trail } = req.body;
    await hierarchyTrailModel.create({ id_hierarchy, id_trail });
    res.redirect('/hierarchy-trail');
  },

  async delete(req, res) {
    const { id } = req.params;
    await hierarchyTrailModel.delete(id);
    res.redirect('/hierarchy-trail');
  }
};