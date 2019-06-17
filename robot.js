'use strict';

const config = require('./config');
const log = require('bunyan').createLogger(config.appLog);

function Robot(options) {
  if (!(this instanceof Robot)) {
    return new Robot(options);
  }

  this.options = { ...config.robot,
    ...options
  };
  this.log = log;
  this.currentDimension = {};
  return this;
}

Robot.prototype.stdin = function() {
  let stdin = process.openStdin();

  stdin.addListener('data', this.listener.bind(this));
};

/*eslint-disable-next-line max-statements*/
Robot.prototype.listener = function(data) {
  let args;
  let x;
  let y;
  let direction;

  data = data.toString().toLowerCase();
  if (data.includes('place')) {
    args = data.replace('place ', '');
    args = args.split(',');
    x = args[0].trim();
    y = args[1].trim();
    direction = args[2].trim();
    this.checkForPlaceArguments({
      x: x,
      y: y,
      direction: direction
    });
    this.currentDimension.x = parseInt(x);
    this.currentDimension.y = parseInt(y);
    this.currentDirection = direction;
    if (this.checkBoundaries()) {
      this.isPlace = true;
      return;
    }

    this.log.info('Out of Bounds');
    return;
  }

  if (this.isPlace && data.includes('report')) {
    this.log.info('Output');
    this.log.info(`${this.currentDimension.x},${this.currentDimension.y},${this.currentDirection}`);
    return;
  } else if (this.isPlace && (data.includes('left') || data.includes('right'))) {
    data = data.replace('\n', '');
    this.leftRight(data, this.currentDirection);
  } else if (this.isPlace && data.includes('move')) {
    let cDirection = this.move(this.currentDirection);
    if (!this.checkBoundaries()) {
      this.log.info('Out of Bounds');
      this.currentDimension = cDirection;
    }
  }
};

Robot.prototype.checkForPlaceArguments = function({
  x,
  y,
  direction
}) {
  if (!(x && y && direction)) {
    throw new Error('Missing Place Arguments');
  }

  return;
};

Robot.prototype.checkBoundaries = function() {
  if (this.currentDimension.x < 0 || this.currentDimension.y < 0) {
    return false;
  } else if (this.currentDimension.x > this.options.dimension.x || this.currentDimension.y > this.options.dimension.y) {
    return false;
  }

  return true;
};

Robot.prototype.leftRight = function(leftRight, direction) {
  const leftRightDirection = `${leftRight.toLowerCase()} ${direction.toLowerCase()}`;

  switch (leftRightDirection) {
    case `left north`:
      this.currentDirection = 'west';
      break;
    case `left west`:
      this.currentDirection = 'south';
      break;
    case `left south`:
      this.currentDirection = 'east';
      break;
    case `left east`:
      this.currentDirection = 'north';
      break;
    case `right north`:
      this.currentDirection = 'east';
      break;
    case `right east`:
      this.currentDirection = 'south';
      break;
    case `right south`:
      this.currentDirection = 'west';
      break;
    case `right west`:
      this.currentDirection = 'north';
      break;
  }
};

Robot.prototype.move = function(currentDirection) {
  // let previousCurrentDirection = `${previousDirection} ${currentDirection}`;
  let cDimension = { ...this.currentDimension};
  switch (currentDirection) {
    case 'north':
      this.currentDimension.y += 1;
      break;
    case 'south':
      this.currentDimension.y -= 1;
      break;
    case 'east':
      this.currentDimension.x += 1;
      break;
    case 'west':
      this.currentDimension.x -= 1;
      break;
  }

  return cDimension;
};

module.exports = Robot;
