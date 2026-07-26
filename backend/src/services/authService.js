const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const AuthService = {
  async register({ username, email, password, role }) {
    const existing = await User.findByEmail(email);
    if (existing) {
      throw { status: 400, message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    return user;
  },

  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  },

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  async updateProfile(userId, { username, email }) {
    const existing = await User.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw { status: 400, message: 'Email already in use' };
    }
    const user = await User.updateProfile(userId, { username, email });
    if (!user) throw { status: 404, message: 'User not found' };
    return user;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const result = await require('../config/database').query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) throw { status: 404, message: 'User not found' };

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) throw { status: 401, message: 'Current password is incorrect' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);
    return { message: 'Password updated successfully' };
  },
};

module.exports = AuthService;
