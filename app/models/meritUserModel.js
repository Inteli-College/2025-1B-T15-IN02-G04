const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM merit_user');
    return res.rows;
  },

  async create({ id_user, id_merit }) {
    const res = await pool.query(
      'INSERT INTO user_merit (id_user, id_merit) VALUES ($1, $2) RETURNING *',
      [id_user, id_merit]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_merit WHERE id = $1', [id]);
  }
};
