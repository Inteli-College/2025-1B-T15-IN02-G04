const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM coment_class');
    return res.rows;
  },

  async create({ id_coment, id_class }) {
    const res = await pool.query(
      'INSERT INTO coment_class (id_coment, id_class) VALUES ($1, $2) RETURNING *',
      [id_coment, id_class]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM coment_class WHERE id = $1', [id]);
  }
};
