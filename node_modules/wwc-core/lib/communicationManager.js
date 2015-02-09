/**
 * Created by: victor on 2/1/15.
 * Source: communicationManager.js
 * Author: victor
 * Description: The communication manager is responsible of managing all the WWC network
 *              operations. This includes, add, modify, and remove sandboxes, this is, keep
 *              track of the global state of the WWC sandBoxes,maintain communication with the server,
 *              and socket states. It will also manage new socket.io connections, new RTC connections,
 *              receive, and send data through the network.
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');
/* NodeJS Utils Module */

function CommunicationManager(connectionManager, jobManager, faultManager) {
    "use strict";

    var self = this;

    /*************************** ADD LISTENER METHODS *********************************/

    /**
     * Description.
     * @public
     * @listener {function} Provided function listener, Does not contains parameters.
     */
    self.addConnectionListener = function (listener) {

        /* Binding the event to the communication manager */
        connectionManager.bindConnectEmiter(listener);
    };

    /**
     * Description.
     * @public
     * @listener {function} Provided function listener, Does not contains parameters.
     */
    self.addDisconnectionListener = function (listener) {

        /* Binding the event to the communication manager */
        connectionManager.binDisconnectEmiter(listener);
    };


    /**
     * Description.
     * @public
     * @listener {function} Provided function listener, Does not contains parameters.
     */
    self.addReconnectionListener = function (listener) {

        /* Binding the event to the communication manager */
        connectionManager.bindReconnectEmiter(listener);
    };


    /**
     * Adds an event listener to be executed when a new sandBox is added(connected).
     * @public
     * @listener {function} Provided function listener, must have at least 1 parameter for
     *                      just added SandBox.Additional parameters will be ignored.
     */
    self.addSandBoxConnectedListener = function (listener) {

        /* Binding the event to the communication manager */
        connectionManager.bindSandBoxConnectedEmiter(listener);
    };

    /**
     * Adds an event listener to be executed when a sandBox is removed(disconnected).
     * @public
     * @listener {function} Provided function listener, must have at least 1 parameter for
     *                      just removed SandBox.Additional parameters will be ignored.
     */
    self.addSandBoxDisconnectedListener = function (listener) {

        /* Binding the event to the communication manager */
        connectionManager.bindSandBoxDisconnectedEmiter(listener);
    };

    /**
     * Description
     * @public
     * @listener {function} Provided function listener, must have at least 1 parameter for
     *                      the details and results object.
     */
    self.addJobExecutionResultsListener = function (listener) {

        /* Binding the event to the communication manager */
        self.on("jobExecutionResponse", listener);
    };

    /**
     * Description
     * @public
     * @listener {function} Provided function listener, must have at least 1 parameter for
     *                      the details object.
     */
    self.addJobExecutionErrorResultsListener = function (listener) {

        /* Binding the event to the communication manager */
        self.on("jobExecutionErrorResponse", listener);
    };

    /*************************** RESULTS LISTENER HANDLERS *********************************/

    /**
     * Description
     * @private
     * @results {function} Description
     */
    function jobExecutionResultsListener(results) {

        /* Details Object */
        var details = {jobID: 0, sndbox: 0, results: 0};

        /* TODO: Handle Arriving Results Here */

        /* Emiting event if present */
        self.emit("jobExecutionResponse", details);
    }

    /* Binding the event to the communication manager */
    connectionManager.bindJobExecutionResponseEmiter(jobExecutionResultsListener);

    /**
     * Description
     * @private
     * @results {function} Description
     */
    function jobExecutionErrorResultsListener(results) {

        /* TODO: Handle Arriving Results Here */
    }

    /* Binding the event to the communication manager */
    connectionManager.bindJobExecutionErrorResponseEmiter(jobExecutionErrorResultsListener);

    /*************************** REMOVE LISTENER METHODS *********************************/
    /**
     * Description
     * @public
     * @listener {function}
     */
    self.removeConnectionListener = function (listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindConnectEmiter(listener);
    };

    /**
     * Description
     * @public
     * @listener {function}
     */
    self.removeDisconnectionListener = function (listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbinDisconnectEmiter(listener);
    };

    /**
     * Description
     * @public
     * @listener {function}
     */
    self.removeReconnectionListener = function (listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindReconnectEmiter(listener);
    };

    /**
     * Removes the event listener that executes when a sandBox is added(Connected).
     * @public
     * @listener {function}
     */
    self.removeSandBoxConnectedListener = function (listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindSandBoxConnectedEmiter(listener);
    };

    /**
     * Removes the event listener that executes when a sandBox is removed(disconnected).
     * @public
     * @listener {function}
     */
    self.removeSandBoxDisconnectedListener = function (listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindSandBoxDisconnectedEmiter(listener);
    };

    /**
     * TODO: Description
     * @private
     * @listener {function}
     */
    function removeJobExecutionResultsListener(listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindJobExecutionResponseEmiter(listener);
    }

    /**
     * TODO: Description
     * @private
     * @listener {function}
     */
    function removeJobExecutionErrorResultsListener(listener) {

        /* Unbinding the event to the communication manager */
        connectionManager.unbindJobExecutionErrorResponseEmiter(listener);
    }


}

/* extend the EventEmitter class using our Communication Manager class */
util.inherits(CommunicationManager, emitter);
/* we specify that this module is a reference to the Communication Manager class */
module.exports = CommunicationManager;