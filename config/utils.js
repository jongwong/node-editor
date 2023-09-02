const path = require('path');
const os = require('os');
const resolve = str => {
  return path.resolve(__dirname, '..', str);
};

let appConfig = {};

try {
  appConfig = require(resolve('app.config.js'));
} catch (error) {
  console.log('加载approcess.config.js❌');
}

module.exports = {
  appConfig,
  resolve,
  host: '0.0.0.0',
};
