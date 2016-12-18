
var Message = require('./Message.js');

var Package = function() {
  var self = {};

  /**
   * Inform package has changed the line
   * @return {[type]} [description]
   */
  self.packageChangedLine = function(args) {
    console.log(args);
  }

  self.packageStarted = function(args) {
    console.log(args);
  }

  self.packageEnd = function(args) {
    console.log(args);
  }

  function constructor() {
    self.packageNumber = generatePackageNumber();


  }

  constructor();
  return self;
}

function generatePackageNumber() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

module.exports = Package;
