/**
 * Created by: victor on 2/1/15.
 * Source: schedulerManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function SchedulerManager() {
    "use strict";

    //TODO: Write schedulerManager body
}

/* extend the EventEmitter class using our Scheduler Manager class */
util.inherits(SchedulerManager, emitter);
/* we specify that this module is a reference to the Scheduler Manager class */
module.exports = SchedulerManager;