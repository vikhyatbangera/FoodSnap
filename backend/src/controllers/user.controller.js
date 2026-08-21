const userService = require('../services/user.service');

async function updateMe(req, res) {
  res.json({ user: await userService.updateMe(req.user._id, req.body, req.file) });
}

async function updateSettings(req, res) {
  res.json({ user: await userService.updateSettings(req.user._id, req.body) });
}

async function saved(req, res) {
  res.json(await userService.getSaved(req.user._id));
}

module.exports = { updateMe, updateSettings, saved };
