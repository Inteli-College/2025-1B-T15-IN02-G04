const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM user_test');
    return res.rows;
  },

  async create({ id_user, id_test }) {
    const res = await pool.query(
      'INSERT INTO user_test (id_user, id_test) VALUES ($1, $2) RETURNING *',
      [id_user, id_test]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_test WHERE id = $1', [id]);
  }
};
