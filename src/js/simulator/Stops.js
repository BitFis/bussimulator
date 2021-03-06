// @flow
/**
 * Contains the different Stops
 */

var jq = require('jquery');
var fabric = require("fabric-browserify").fabric;

/**
 * Size of the stops in pixel
 * @type {Number}
 */
const STOP_SIZE = 30;
const DRONE_RADIUS = 250;

var StopClass = function(config) {
 var self = {};

 /**
  * Dataobject of the stop, containg all informations
  * @type {[type]}
  */
 var Stop = jq.extend({
   /**
    * Name to display of the stop
    * @type {String}
    */
   name: '',

   id: 0,

   /**
    * Extra information of the stop
    * @type {String}
    */
   description: '',

   /**
    * If it is a hub
    * @type {Boolean}
    */
   hub: false,

   /**
    * Information of the lines, which this stop is part of
    * @type {Array}
    */
   lines: [],

   /**
    * Position in grid
    * @type {Object}
    */
   pos: {
     top: 0,
     left: 0
   }
 }, config);

 /**
  * Fabric circle / GUI representation
  * @type {fabric}
  */
 var Circle = null;

 /**
  * Array of directly connected lines
  * @type {Array}
  */
 var Lines = [];

 /**
  * Text, which can be activated to show
  */
 var OverlayedText = null;

  /**
   * Drone ring to represent the the location of the drone
   * @type {[type]}
   */
  var droneRing = null;

  self.getCircle = function() {
    return Circle;
  };

 /**
  * click handler for the
  * @return {[type]} [description]
  */
 function onClick() {
   console.log('stop clicked');
 }

 /**
  * Returns the position of the Stop
  */
 self.getPos = function() {
   return Stop.pos;
 };

 /**
  * Returns main data object as json
  */
 self.getJSON = function() {
   return JSON.stringify(Stop);
 };

  // id is simply generated by the pos, since it makes no sence to have two stops
  // on the exact same position, if so, it must be the same
  self.getId = function() {
   return Stop.pos.left + '|' + Stop.pos.top;
 };

 /**
  *
  * @return {Boolean} If it supports a hub / drones
  */
 self.isHub = function(value) {
   return Stop.hub = typeof value !== 'undefined' ? value : Stop.hub;
 };

 /**
  * Update position and references of this stop
  * @return {[type]} [description]
  */
  self.update = function() {
  // update position from circle
    Stop.pos = {
      top: Circle.top,
      left: Circle.left
    };

    updateLine();
  };

  function updateLine() {
    Stop.lines = [];
    jq.each(Lines, function(i, line) {
      if(Stop.lines.indexOf(line.name) < 0) {
        Stop.lines.push(line.name);
      }
    });
  }

 /**
  * Drawes / redraws the stop on the map
  * TMP: later move to other class for drawing -> seperate GUI and Logic
  * This is a logic class
  * @param canvas Needs fabricjs object for drawing
  * @return {[type]} [description]
  */
 self.draw = function(canvas) {
  canvas.remove(Circle);
  canvas.add(Circle);

   // TODO: add circle for drone

   // temporary, show location
   //self.debug(canvas);
 };

 self.debug = function(canvas) {
   canvas.add(OverlayedText);
 }

 /**
  * Toggle line, if added remove, and if not in array add
  * @return true = added / false = removed
  */
  self.toggleLine = function(line) {
    var index = self.removeLine(line);

    if(index < 0) {
      self.addLine(line);
    }

    return index < 0;
  };

  /**
   * Only add Line once, prevents adding multible times the same Line, Since
   * it is just possible
   * @param {[type]} line [description]
   */
  self.addLine = function(line) {
    self.removeLine(line);

    Stop.lines.push(line.getId());
    Lines.push(line);
  };

  self.removeLine = function(line) {
    var index = Lines.indexOf(line);

    if(index >= 0) {
      Stop.lines.splice(Stop.lines.indexOf(line.getId()));
      Lines.splice(index, 1);
    }

    return index;
  };

  self.getLines = function() {
    return Lines;
  };

  self.hideRadius = function(canvas) {
    canvas.remove(droneRing);
  };

  self.showRadius = function(canvas) {
    canvas.add(droneRing);
    droneRing.sendToBack();
  };

 self.remove = function(canvas) {
    jq.each(Lines, function(i, line) {
      line.removeStop(self);
    });
    canvas.remove(Circle);
 };

 /**
  * React on button click
  */
 self.click = function() {
   console.log('stop clicked');
 };

 /**
  * Is given coordinate in range
  * @return {[type]} return -1 if not in reach, and if in range, return distance
  */
 self.inRange = function(coordinate) {
   var x = Math.abs(coordinate.left - Stop.pos.left - STOP_SIZE / 2);
   var y = Math.abs(coordinate.top - Stop.pos.top - STOP_SIZE / 2);
   var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
   return DRONE_RADIUS >= length ? length : -1;
 };

 /**
  * Encapsulated function to prepare eventhandling of the circle
  */
  (function() {
    Circle = new fabric.Circle({
      radius: STOP_SIZE / 2, left: Stop.pos.left, top: Stop.pos.top, fill: Stop.hub ? 'red' : '#33f',
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true
    });

    OverlayedText = new fabric.Text('' + self.getId(), {
      left: Stop.pos.left, //Take the block's position
      top: Stop.pos.top,
      fill: 'black'
    });

    // draw drone ring
    droneRing = new fabric.Circle({
      radius: DRONE_RADIUS,
      left: Stop.pos.left - (DRONE_RADIUS - (STOP_SIZE / 2)),
      top: Stop.pos.top - (DRONE_RADIUS - (STOP_SIZE / 2)),
      stroke: 'red',
      fill: 'rgba(0,0,255,0.1)',
      strokeWidth: 2,
      opacity: 0.8,
      selectable: false
    })

  })();

 return self;
}

StopClass.findClosestStop = function(stops, pos) {
  var closest = null;
  var lastDistance = DRONE_RADIUS + 1;
  jq.each(stops, function(i, stop) {
    var distance = stop.inRange(pos);
    if(distance >= 0 && lastDistance > distance) {
      closest = stop;
      lastDistance = distance;
    }
  });
  return closest;
};

StopClass.getRadius = function() {
  return (STOP_SIZE / 2.0);
}

StopClass.getHub = function(stops) {
  var found = null;
  jq.each(stops, function(i, stop) {
    if(stop.isHub()) {
      found = stop;
    }
  });
  return found;
};

module.exports = StopClass;
