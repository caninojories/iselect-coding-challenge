'use strict';

const bformat = require('bunyan-format');
const formatOut = bformat({
  outputMode: 'short'
});

const config = {
  appLog: {
    name: 'ISelect',
    streams: [{
      stream: formatOut,
      level: 'debug'
    }]
  },
  robot: {
    dimension: {
      x: 5,
      y: 5
    }
  }
};

module.exports = config;
