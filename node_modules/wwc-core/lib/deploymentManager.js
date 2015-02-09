/**
 * Created by: victor on 2/1/15.
 * Source: deploymentManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function DeploymentManager() {
    "use strict";

    //TODO: Write deploymentManager body
}

/* extend the EventEmitter class using our Deployment Manager class */
util.inherits(DeploymentManager, emitter);
/* we specify that this module is a reference to the Deployment Manager class */
module.exports = DeploymentManager;