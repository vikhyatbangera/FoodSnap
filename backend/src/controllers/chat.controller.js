const chatService = require('../services/chat.service');

async function chat(req, res) {
  res.json(await chatService.chat(req.user, req.body.message));
}

module.exports = { chat };
