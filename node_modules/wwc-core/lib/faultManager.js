/**
 * Created by: victor on 2/1/15.
 * Source: faultManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function FaultManager() {
    "use strict";

    //TODO: Write faultManager body
}

/* extend the EventEmitter class using our Fault Manager class */
util.inherits(FaultManager, emitter);
/* we specify that this module is a reference to the Fault Manager class */
module.exports = FaultManager;