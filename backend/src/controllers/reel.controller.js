const reelService = require('../services/reel.service');

async function list(req, res) {
  res.json(await reelService.listReels(req.query, req.user?._id));
}

async function create(req, res) {
  res.status(201).json({ reel: await reelService.createReel(req.user._id, req.body, req.files) });
}

async function update(req, res) {
  res.json({ reel: await reelService.updateReel(req.params.id, req.user._id, req.body, req.files) });
}

async function remove(req, res) {
  res.json(await reelService.deleteReel(req.params.id, req.user._id));
}

async function view(req, res) {
  res.json(await reelService.incrementView(req.params.id));
}

module.exports = { list, create, update, remove, view };
