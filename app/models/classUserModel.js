const pool = require('../db');

module.exports = {
  async getAll() {
    const res = await pool.query('SELECT * FROM class_user');
    return res.rows;
  },

  async create({ id_user, id_class }) {
    const res = await pool.query(
      'INSERT INTO user_class (id_user, id_class) VALUES ($1, $2) RETURNING *',
      [id_user, id_class]
    );
    return res.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM user_class WHERE id = $1', [id]);
  }
};
