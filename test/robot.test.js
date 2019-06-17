'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const Robot = require('../robot');
// const config = require('../config');
// const log = require('bunyan').createLogger(config.appLog);

describe('Robot', () => {
  let sandbox;
  let robot;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    robot = require('../robot')();
    sandbox.spy(robot.log, 'info');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('must be constructable', () => {
    expect(robot).to.be.instanceof(Robot);
  });

  it('should disrecard other commands until PLACE command is set', () => {
    robot.listener('MOVE');
    robot.listener('LEFT');
    robot.listener('RIGHT');
    robot.listener('REPORT');
    expect(robot.currentDimension.x).to.equal(undefined);
    expect(robot.currentDimension.y).to.equal(undefined);
    expect(robot.currentDirection).to.equal(undefined);
  });

  it('should cater the "PLACE" keyword', () => {
    robot.listener('PLACE 0,0,NORTH');
    expect(robot.currentDimension.x).to.equal(0);
    expect(robot.currentDimension.y).to.equal(0);
    expect(robot.currentDirection).to.equal('north');
  });

  it('should cater the "REPORT" keyword', () => {
    robot.listener('PLACE 0,0,NORTH');
    robot.listener('REPORT');
    expect(robot.log.info.called).to.equal(true);
    expect(robot.log.info.getCall(0).args[0]).to.equal('Output');
    expect(robot.log.info.getCall(1).args[0]).to.equal(`${robot.currentDimension.x},${robot.currentDimension.y},${robot.currentDirection}`);
  });

  it('should cater the "LEFT" keyword', () => {
    robot.listener('PLACE 0,0,EAST');
    robot.listener('LEFT');
    robot.listener('MOVE');
    robot.listener('REPORT');
    expect(robot.log.info.getCall(0).args[0]).to.equal('Output');
    expect(robot.log.info.getCall(1).args[0]).to.equal(`${robot.currentDimension.x},${robot.currentDimension.y},${robot.currentDirection}`);
  });

  it('should cater the "RIGHT" keyword', () => {
    robot.listener('PLACE 1,1,EAST');
    robot.listener('RIGHT');
    robot.listener('MOVE');
    robot.listener('REPORT');
    expect(robot.log.info.getCall(0).args[0]).to.equal('Output');
    expect(robot.log.info.getCall(1).args[0]).to.equal(`${robot.currentDimension.x},${robot.currentDimension.y},${robot.currentDirection}`);
  });

  it('should cater the "MOVE" keyword', () => {
    robot.listener('PLACE 0,0,NORTH');
    robot.listener('MOVE');
    robot.listener('REPORT');
    expect(robot.log.info.getCall(0).args[0]).to.equal('Output');
    expect(robot.log.info.getCall(1).args[0]).to.equal(`${robot.currentDimension.x},${robot.currentDimension.y},${robot.currentDirection}`);
  });

  it('should handle out of bounds (PLACE mode)', () => {
    robot.listener('PLACE -1,0,NORTH');
    expect(robot.log.info.getCall(0).args[0]).to.equal('Out of Bounds');
  });

  it('should handle out of bounds', () => {
    robot.listener('PLACE 0,0,NORTH');
    robot.listener('LEFT');
    robot.listener('MOVE');
    expect(robot.log.info.getCall(0).args[0]).to.equal('Out of Bounds');
  });
});
