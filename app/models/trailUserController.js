const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM trail_user');
    return res.rows;
  },

  async create({ id_user, id_trail }) {
    const res = await pool.query(
      'INSERT INTO user_trail (id_user, id_trail) VALUES ($1, $2) RETURNING *',
      [id_user, id_trail]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_trail WHERE id = $1', [id]);
  }
};
