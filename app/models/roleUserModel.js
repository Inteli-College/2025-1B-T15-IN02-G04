const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM role_user');
    return res.rows;
  },

  async create({ id_user, id_role }) {
    const res = await pool.query(
      'INSERT INTO role_user (id_user, id_role) VALUES ($1, $2) RETURNING *',
      [id_user, id_role]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM role_user WHERE id = $1', [id]);
  }
};
