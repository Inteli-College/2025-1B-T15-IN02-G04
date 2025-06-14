const pool = require('../config/db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM class_user');
    return res.rows;
  },

  async create({ id_user, id_class }) {
    const res = await pool.query(
      'INSERT INTO class_user (id_user, id_class) VALUES ($1, $2) RETURNING *',
      [id_user, id_class]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM class_user WHERE id = $1', [id]);
  }
};
