const interactionService = require('../services/interaction.service');

async function like(req, res) {
  res.json(await interactionService.toggleLike(req.user._id, req.body.targetType, req.body.target));
}

async function save(req, res) {
  res.json(await interactionService.toggleSave(req.user._id, req.body.targetType, req.body.target));
}

module.exports = { like, save };
