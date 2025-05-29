const db = require("../config/db");

class User {
  static async getAll() {
    const result = await db.query('SELECT * FROM "user"');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM "user" WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async createUser(
    first_name,
    last_name,
    email,
    hash_password,
    username
  ) {
    const result = await db.query(
      'INSERT INTO "user" (first_name, last_name, email, hash_password, username) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [first_name, last_name, email, hash_password, username]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await db.query(
      'UPDATE "user" SET first_name = $1, last_name = $2, email = $3, username = $4 WHERE id = $5 RETURNING *',
      [data.first_name, data.last_name, data.email, data.username, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM "user" WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rowCount > 0;
  }

  static async findUser(email) {
    const result = await db.query('SELECT * FROM "user" WHERE email = $1', [
      email,
    ]);
    return result.rows[0];
  }

  static async findUserByUsername(username) {
    const result = await db.query('SELECT * FROM "user" WHERE username = $1', [
      username,
    ]);
    return result.rows[0];
  }
}

module.exports = {
  findUser: User.findUser,
  createUser: User.createUser,
  findUserByUsername: User.findUserByUsername,
};
