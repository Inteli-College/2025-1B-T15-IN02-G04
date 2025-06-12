const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM trail_user');
    return res.rows;
  },

  async create({ id_user, id_trail }) {
    const res = await pool.query(
      'INSERT INTO trail_user (id_user, id_trail) VALUES ($1, $2) RETURNING *',
      [id_user, id_trail]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM trail_user WHERE id = $1', [id]);
  }
};
