const pool = require('../config/db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM hierarchy_trail');
    return res.rows;
  },

  async create({ id_hierarchy, id_trail }) {
    const res = await pool.query(
      'INSERT INTO hierarchy_trail (id_hierarchy, id_trail) VALUES ($1, $2) RETURNING *',
      [id_hierarchy, id_trail]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM hierarchy_trail WHERE id = $1', [id]);
  }
};
