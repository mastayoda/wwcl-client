/**
 * Created by: victor on 2/1/15.
 * Source: metricsManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function MetricsManager() {
    "use strict";

    //TODO: Write metricsManager body
}

/* extend the EventEmitter class using our Metrics Manager class */
util.inherits(MetricsManager, emitter);
/* we specify that this module is a reference to the Metrics Manager class */
module.exports = MetricsManager;