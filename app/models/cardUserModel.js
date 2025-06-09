const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM card_user');
    return res.rows;
  },

  async create({ id_user, id_card }) {
    const res = await pool.query(
      'INSERT INTO card_user (id_user, id_card) VALUES ($1, $2) RETURNING *',
      [id_user, id_card]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM card_user WHERE id = $1', [id]);
  }
};