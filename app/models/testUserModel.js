const pool = require('../config/db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM test_user');
    return res.rows;
  },

  async create({ id_user, id_test }) {
    const res = await pool.query(
      'INSERT INTO test_user (id_user, id_test) VALUES ($1, $2) RETURNING *',
      [id_user, id_test]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM test_user WHERE id = $1', [id]);
  }
};
