const pool = require('../config/database');

const User = {
  async create({ username, email, password, role = 'user' }) {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, password, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  async updateProfile(id, { username, email }) {
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, role, created_at',
      [username, email, id]
    );
    return result.rows[0];
  },

  async updatePassword(id, hashedPassword) {
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username, email',
      [hashedPassword, id]
    );
    return result.rows[0];
  },

  async updateRole(id, role) {
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
      [role, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  },
};

module.exports = User;
