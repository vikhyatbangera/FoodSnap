const fs = require('fs');
const path = require('path');
const env = require('../config/env');

// Stored as a path when PUBLIC_BASE_URL is unset so the same database works
// behind any host; the client resolves it against the API origin.
function uploadUrl(filename) {
  return `${env.publicBaseUrl}/uploads/${filename}`;
}

// Hosts with an ephemeral filesystem (Render) lose uploads on redeploy, so the
// repo-tracked seed media is restored on boot to keep seeded rows resolvable.
function restoreSeedAssets() {
  const assetsDir = path.resolve(__dirname, '../../seed/assets');
  if (!fs.existsSync(assetsDir)) return;
  fs.mkdirSync(env.uploadsDir, { recursive: true });
  for (const asset of fs.readdirSync(assetsDir)) {
    if (!/\.(png|mp4)$/i.test(asset)) continue;
    const target = path.join(env.uploadsDir, asset);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(assetsDir, asset), target);
  }
}

module.exports = { uploadUrl, restoreSeedAssets };
