/**
 * Created by: victor on 2/1/15.
 * Source: connectionManager.js
 * Author: victor
 * Description:
 *
 */
var emitter = require('events').EventEmitter, /* Event Emitter Module */
    util = require('util');

function ConnectionManager() {
    "use strict";

    var io = require('socket.io-client'),
        Map = require("collections/map"), /* Map Collection Data Structure Class */
        sndbxMap = new Map(), /* The Map of SandBoxes */
        self = this,
        serverURL = "", /* The Server URL */
        socket;

    /**
     * Sets the Server URL string for this communicator.
     * @public
     * @URL (string) The server URL string.
     */
    self.setServerURL = function (URL) {

        /* Validating URL */
        if(URL.isNull() || URL.isEmpty() || typeof URL !== "string"){
            throw new Error("Empty or null URL provided, please provide a valid URL");
        }

        serverURL = URL;
    };

    /**
     * Return  the server URL of this communicator.
     * @public
     * @return {string} The server URL string.
     */
    self.getServerURL = function () {
        return serverURL;
    };

    /*************************** SANDBOX MAP METHODS *********************************/

    /**
     * Returns the sandbox hash map.
     * @public
     * @return {Object} The internal sandbox hash map store.
     */
    self.getSandBoxMap = function () {
        return sndbxMap;
    };

    /**
     * Returns the length of the connected sandboxes collection.
     * @public
     * @return {Integer} The current number of connected sandboxes.
     */
    self.getSandBoxCount = function () {
        return sndbxMap.length;
    };

    /**
     * Check if the current SandBox ID is present in the connected sandboxes.
     * @public
     * @key {integer} The ID of the sandbox socket.
     * @return {boolean} True or false depending of the existence of the
     *                   key in the map.
     */
    self.hasSandBox = function (key) {
        return sndbxMap.has(key);
    };

    /**
     * Get sandBox for the given ID.
     * @public
     * @key {integer} The ID of the sandbox socket.
     * @return {type} Description
     */
    self.getSandBox = function (key) {
        return sndbxMap.get(key);
    };

    /**
     * Get all current connected SandBoxes IDs.
     * @public
     * @return {array} Collection of all sandboxes keys.
     */
    self.getSandBoxesKeys = function () {
        return sndbxMap.keys();
    };

    /**
     * Get all connected SandBoxes.
     * @public
     * @return {array} Collection of all sandboxes.
     */
    self.getSandBoxes = function () {
        return sndbxMap.values();
    };

    /**
     * Returns an object with each property name and value corresponding to the ID and SandBoxes in this collection.
     * @public
     * @return {object} Object with each sandBox as members in the form of ID:SandBox.
     */
    self.sandBoxesToObject = function () {
        return sndbxMap.toObject();
    };

    /**
     * Returns a JSON object of the SandBoxes map.
     * @public
     * @return {string} JSON string.
     */
    self.sandBoxesToJSON = function () {
        return sndbxMap.toJSON();
    };

    /**
     * Return all SandBoxes with its IDs in pairs.
     * @public
     * @return {array} Collection all [ID, SandBox] entries.
     */
    self.getIDAndSandBoxPairs = function () {
        return sndbxMap.entries();
    };

    /**
     * Maps each SandBox to a given callback function, returns the processed value in a collection
     * in the same order.
     * @public
     * @callback {function} function for the Sandbox mapping.Must contain
     *                      a parameter for the sandbox, and a return for the
     *                      mapped result.
     * @return {array} Collection mapped results.
     */
    self.mapSandBoxes = function (callback) {
        return sndbxMap.map(callback);
    };

    /**
     * Returns an array with each SandBox from this collection that passes the given test.
     * @public
     * @callback {function} function for the filtering.Must contain
     *                      a parameter for the sandbox, and a return a boolean,
     *                      true to include the sandbox in the collection, or
     *                      false to exclude the sandbox.
     * @return {array} Collection filtered sandboxes.
     */
    self.filterSandBoxes = function (callback) {
        return sndbxMap.filter(callback).entries();
    };

    /**
     * Calls the callback for each Sandbox in the collection
     * @public
     * @callback {function} function for the foreach iteration.
     */
    self.forEachSandBox = function (callback) {
        sndbxMap.forEach(callback);
    };

    /**
     * Returns an array of [key, class] entries where every SandBox
     * from the collection is placed into the same equivalence
     * class if they return the same key through the given callback.
     * @public
     * @callback {function} function for the grouping.Must contain
     *                      a parameter for the sandbox, and a return a key to be used
     *                      by the grouping.
     * @return {array} Collection of [key, class] pairs according to the grouping.
     */
    self.groupSandBoxes = function (callback) {
        return sndbxMap.group(callback);
    };

    /**
     * Returns whether any sandBox in this collection passes a given test.
     * @public
     * @callback {function} function for the checking.Must contain
     *                      a parameter for the sandbox, and a return a boolean that
     *                      indicates if pass or fail the test.
     * @return {boolean} True if at least one sandBox passes the test, false if otherwise.
     */
    self.someSandBox = function (callback) {
        return sndbxMap.some(callback);
    };

    /**
     * Returns whether every SandBox in this collection passes a given test.
     * @public
     * @callback {function} function for the checking.Must contain
     *                      a parameter for the sandbox, and a return a boolean that
     *                      indicates if pass or fail the test.
     * @return {boolean} True if all sandBox passes the test, false if otherwise.
     */
    self.everySandBox = function (callback) {
        return sndbxMap.every(callback);
    };

    /*************************** SOCKET.IO EVENTS *********************************/
    /**
     * Binds the socket to each network IO event.
     * @private
     */
    function bindSocketEvents() {

        socket.on('connect', function () {

            /* Reconnect handler */
            socket.on('reconnect', function () {
                /* Request sandbox listing after reconnection*/
                socket.emit("requestReconnectSndbxLst");
            });

            /* Disconnect handler */
            socket.on('disconnect', function () {
                /* Executing disconnect event handler, it will be executed
                 if the communication manager have passed a callback function */
                self.emit("disconnect");
            });

            /* New Sandbox Connected handler */
            socket.on('sndbxConnected', function (sndbx) {

                /* Adding incoming SandBox */
                sndbxMap.set(sndbx.id, sndbx);
                /* Executing sandBoxConnected event handler, it will be executed
                 if the communication manager have passed a callback function */
                self.emit("sndbxConnected", sndbx);
            });

            /* Sandbox Disconnected handler */
            socket.on('sndbxDisconnected', function (id) {

                /* Temporary storing the deleted sandbox(for the emitter */
                var sndbx = sndbxMap.get(id);
                /* Removing incoming sandbox */
                sndbxMap.delete(id);
                /* Executing sandBoxConnected event handler, it will be executed
                 if the communication manager have passed a callback function */
                self.emit("sndbxDisconnected", sndbx);

            });

            /* Receive Sandbox list Handler */
            socket.on('responseSndbxLst', function (sndbxLst) {

                var i;

                /* Adding each incoming sandboxes */
                for (i = 0; i < sndbxLst.length; i++) {
                    sndbxMap.set(sndbxLst[i].id, sndbxLst[i]);
                }

                /*  After sandbox listing is ready, trigger the
                 connected event.*/
                self.emit("connect");
            });


            /* Receive job execution result handler */
            /* Note: This will be executed asynchronously as the
             executed sandboxes are done executing.
             */
            socket.on('jobExecutionResponse', function (results) {
                self.emit("jobExecutionResponse", results);
            });

            /* Receive job error result */
            /* Note: This will be executed asynchronously as the
             executed sandboxes return execution error or disconnected.
             */
            socket.on('jobExecutionErrorResponse', function (results) {
                self.emit("jobExecutionErrorResponse", results);
            });

            /* Receive Sandbox list Handler */
            socket.on('responseReconnectSndbxLst', function (sndbxLst) {

                var i;

                /* Adding each incoming sandboxes */
                for (i = 0; i < sndbxLst.length; i++) {
                    sndbxMap.set(sndbxLst[i].id, sndbxLst[i]);
                }

                /*  After sandbox listing is ready, trigger the
                 connected event.*/
                self.emit("reconnect");
            });

            /* After reconnecting Receive Sandbox list Handler */
            socket.on('responseSndbxLst', function (sndbxLst) {

                var i;

                /* Adding each incoming sandboxes */
                for (i = 0; i < sndbxLst.length; i++) {
                    sndbxMap.set(sndbxLst[i].id, sndbxLst[i]);
                }

                /*  After sandbox listing is ready, trigger the
                 connected event.*/
                self.emit("connect");
            });

            /* Request sandbox listing on connect */
            socket.emit("requestSndbxLst");

        });
    }

    /**
     * Connect to the remote server.
     * @public
     * @info {Object} Object containing the metrics of this machine. Including
     * the info.isClient property which Indicates if this is a client or
     * sandbox instance.
     */
    this.connect = function (info) {

        /* Validating URL */
        if(serverURL.isNull() || serverURL.isEmpty() || typeof serverURL !== "string"){
            throw new Error("Server URL not set, please set a valid URL");
        }
        /* Validating info */
        if(info.isNull() || typeof info !== "object"){
            throw new Error("info must be a non null object");
        }

        self.connect(serverURL,info);
    };

    /**
     * Connect to the remote server.
     * @public
     * @URL {String} The URL String.
     * @info {Object} Object containing the metrics of this machine. Including
     * the info.isClient property which Indicates if this is a client or
     * sandbox instance.
     */
    this.connect = function (URL, info) {

        /* Validating URL */
        if(URL.isNull() || URL.isEmpty() || typeof URL !== "string"){
            throw new Error("Empty or null URL provided, please provide a valid URL");
        }
        /* Validating info */
        if(info.isNull() || typeof info !== "object"){
            throw new Error("info must be a non null object");
        }

        /* Set new server URL */
        serverURL = URL;

        socket = io.connect(URL, {
            query: 'sysInfo=' + JSON.stringify(info)
        });

        /* Bind socket events */
        bindSocketEvents();
    };

    /*************************** BIND EXTERNAL EMIT FUNCTIONS *********************************/

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindConnectEmiter = function (listener) {
        self.on("connect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.binDisconnectEmiter = function (listener) {
        self.on("disconnect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindReconnectEmiter = function (listener) {
        self.on("reconnect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindSandBoxConnectedEmiter = function (listener) {
        self.on("sndbxConnected", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindSandBoxDisconnectedEmiter = function (listener) {
        self.on("sndbxDisconnected", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindJobExecutionResponseEmiter = function (listener) {
        self.on("jobExecutionResponse", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.bindJobExecutionErrorResponseEmiter = function (listener) {
        self.on("jobExecutionErrorResponse", listener);
    };


    /*************************** UNBIND EXTERNAL EMIT FUNCTIONS *********************************/

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindConnectEmiter = function (listener) {
        self.removeListener("connect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbinDisconnectEmiter = function (listener) {
        self.removeListener("disconnect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindReconnectEmiter = function (listener) {
        self.removeListener("reconnect", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindSandBoxConnectedEmiter = function (listener) {
        self.removeListener("sndbxConnected", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindSandBoxDisconnectedEmiter = function (listener) {
        self.removeListener("sndbxDisconnected", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindJobExecutionResponseEmiter = function (listener) {
        self.removeListener("jobExecutionResponse", listener);
    };

    /*
     * Description
     * @public
     * @listener {function} Description
     */
    self.unbindJobExecutionErrorResponseEmiter = function (listener) {
        self.removeListener("jobExecutionErrorResponse", listener);
    };

}

/* extend the EventEmitter class using our Connection Manager class */
util.inherits(ConnectionManager, emitter);
/* we specify that this module is a reference to the Connection Manager class */
module.exports = ConnectionManager;