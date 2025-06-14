const pool = require('../config/db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM user_like');
    return res.rows;
  },

  async create({ id_user, id_like }) {
    const res = await pool.query(
      'INSERT INTO user_like (id_user, id_like) VALUES ($1, $2) RETURNING *',
      [id_user, id_like]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_like WHERE id = $1', [id]);
  }
};
