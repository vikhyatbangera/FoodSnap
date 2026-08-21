const searchService = require('../services/search.service');

async function search(req, res) {
  res.json(await searchService.search(req.query));
}

module.exports = { search };
