const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM comment_class');
    return res.rows;
  },

  async create({ id_comment, id_class }) {
    const res = await pool.query(
      'INSERT INTO comment_class (id_comment, id_class) VALUES ($1, $2) RETURNING *',
      [id_comment, id_class]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM comment_class WHERE id = $1', [id]);
  }
};
