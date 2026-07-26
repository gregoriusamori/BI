const AuthService = require('../services/authService');

const authController = {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const user = await AuthService.register({ username, email, password });
      res.status(201).json({ message: 'User registered', user });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      res.json({ message: 'Profile updated', user });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const result = await AuthService.changePassword(req.user.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
