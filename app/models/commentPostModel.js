const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM comment_post');
    return res.rows;
  },

  async create({ id_comment, id_post }) {
    const res = await pool.query(
      'INSERT INTO comment_post (id_comment, id_post) VALUES ($1, $2) RETURNING *',
      [id_comment, id_post]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM comment_post WHERE id = $1', [id]);
  }
};
