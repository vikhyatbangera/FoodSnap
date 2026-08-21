const authService = require('../services/auth.service');
const userService = require('../services/user.service');

async function register(req, res) {
  const user = await authService.register(req.body);
  const login = await authService.login(req.body.email, req.body.password);
  res.status(201).json({ token: login.token, user });
}

async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(result);
}

async function me(req, res) {
  res.json({ user: await userService.getMe(req.user._id) });
}

module.exports = { register, login, me };
