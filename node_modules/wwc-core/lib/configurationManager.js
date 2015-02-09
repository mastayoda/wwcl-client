/**
 * Created by: victor on 2/1/15.
 * Source: configurationManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');
/* NodeJS Utils Module */

function ConfigurationManager() {
    "use strict";

    //TODO: Write configurationManager body
}

/* extend the EventEmitter class using our Configuration Manager class */
util.inherits(ConfigurationManager, emitter);
/* we specify that this module is a reference to the Configuration Manager class */
module.exports = ConfigurationManager;