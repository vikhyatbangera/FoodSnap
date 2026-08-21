const partnerService = require('../services/partner.service');

async function updateMe(req, res) {
  res.json({ partner: await partnerService.updateProfile(req.user._id, req.body, req.file) });
}

async function list(req, res) {
  res.json(await partnerService.listPartners(req.query.page, req.query.limit));
}

async function get(req, res) {
  res.json(await partnerService.getPartner(req.params.id));
}

module.exports = { updateMe, list, get };
