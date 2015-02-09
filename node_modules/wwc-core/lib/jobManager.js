/**
 * Created by: victor on 2/1/15.
 * Source: jobManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function JobManager() {
    "use strict";

    //TODO: Write jobManager body
}

/* extend the EventEmitter class using our Job Manager class */
util.inherits(JobManager, emitter);
/* we specify that this module is a reference to the Job Manager class */
module.exports = JobManager;