const fs = require('fs');

function load(env = process.env.APP_ENV) {
  const file = fs.readFileSync(`./configs/${env}.json`, 'utf8');
  return JSON.parse(file);
}

module.exports = { load };
