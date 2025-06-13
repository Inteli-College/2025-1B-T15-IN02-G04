const pool = require('../config/db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM module_user');
    return res.rows;
  },

  async create({ id_user, id_module }) {
    const res = await pool.query(
      'INSERT INTO module_user (id_user, id_module) VALUES ($1, $2) RETURNING *',
      [id_user, id_module]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM module_user WHERE id = $1', [id]);
  }
};
