/**
 * Created by: victor on 1/31/15.
 * Source: core.js
 * Author: victor
 * Description: World Wide Cluster Core Module main file. Contains the all aggregated components
 *              as private properties. Can only be accessed by "var Core = require("wwc-core");" statement.
 *
 */
function Core() {
    "use strict";

    /* Private Members */
    var communicationManager,
        connectionManager,
        configurationManager,
        deploymentManager,
        faultManager,
        fileSystemManager,
        jobManager,
        metricsManager,
        schedulerManager;

    /* Loading Modules */
    fileSystemManager = new (require("./lib/fileSystemManager"))();
    connectionManager = new (require("./lib/connectionManager"))();
    /* Connection Manager for this communicator */
    jobManager = new (require("./lib/jobManager"))(fileSystemManager);
    faultManager = new (require("./lib/faultManager"))(jobManager);
    communicationManager = new (require("./lib/communicationManager"))(connectionManager, jobManager, faultManager);
    configurationManager = new (require("./lib/configurationManager"))();
    deploymentManager = new (require("./lib/deploymentManager"))(jobManager);
    metricsManager = new (require("./lib/metricsManager"))(fileSystemManager);
    schedulerManager = new (require("./lib/schedulerManager"))();

    /* Getters Section */

    /**
     * Getter that returns Communication Manager Core Object.
     * @public
     * @return {Object} Communication Manager Object.
     */
    this.getCommunicationManager = function () {
        return communicationManager;
    };

    /**
     * Getter that returns Connection Manager Core Object.
     * @public
     * @return {Object} Connection Manager Object.
     */
    this.getConnectionManager = function () {
        return connectionManager;
    };

    /**
     * Getter that returns Fault Manager Core Object.
     * @public
     * @return {Object} Communication Fault Object.
     */
    this.getFaultManager = function () {
        return faultManager;
    };

    /**
     * Getter that returns Job Manager Core Object.
     * @public
     * @return {Object} Job Manager Object.
     */
    this.getJobManager = function () {
        return jobManager;
    };

    /**
     * Getter that returns Metrics Manager Core Object.
     * @public
     * @return {Object} Metrics Manager Object.
     */
    this.getMetricsManager = function () {
        return metricsManager;
    };

    /**
     * Getter that returns File System Manager Core Object.
     * @public
     * @return {Object} File System Manager Object.
     */
    this.getFileSystemManager = function () {
        return fileSystemManager;
    };

    /**
     * Getter that returns Scheduler Manager Core Object.
     * @public
     * @return {Object} Scheduler Manager Object.
     */
    this.getSchedulerManager = function () {
        return schedulerManager;
    };

    /**
     * Getter that returns Deployment Manager Core Object.
     * @public
     * @return {Object} Deployment Manager Object.
     */
    this.getDeploymentManager = function () {
        return deploymentManager;
    };

    /**
     * Getter that returns Configuration Manager Core Object.
     * @public
     * @return {Object} Configuration Manager Object.
     */
    this.getConfigurationManager = function () {
        return configurationManager;
    };


}

/* we specify that this module is a reference to the WWC Core class */
module.exports = Core;