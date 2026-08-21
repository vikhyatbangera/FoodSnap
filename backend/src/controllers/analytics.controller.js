const analyticsService = require('../services/analytics.service');

async function overview(req, res) {
  res.json(await analyticsService.getOverview(req.user._id, req.query.days));
}

module.exports = { overview };
