/**
 * Created by: victor on 2/1/15.
 * Source: fileSystemManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function FileSystemManager() {
    "use strict";

    //TODO: Write fileSystemManager body
}

/* extend the EventEmitter class using our File System Manager class */
util.inherits(FileSystemManager, emitter);
/* we specify that this module is a reference to the File System Manager class */
module.exports = FileSystemManager;