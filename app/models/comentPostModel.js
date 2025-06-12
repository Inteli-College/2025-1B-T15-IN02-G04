const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM coment_post');
    return res.rows;
  },

  async create({ id_coment, id_post }) {
    const res = await pool.query(
      'INSERT INTO coment_post (id_coment, id_post) VALUES ($1, $2) RETURNING *',
      [id_coment, id_post]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM coment_post WHERE id = $1', [id]);
  }
};
