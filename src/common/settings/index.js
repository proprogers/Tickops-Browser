const { isRenderer } = require('../utils');

module.exports = isRenderer() ? require('./render') : require('./main');
