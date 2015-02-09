/**
 * Created by: victor on 1/31/15.
 * Source: communicationManagerSpec.js
 * Author: victor
 * Description: Test File for the Communication Manager file.
 *
 */
var expect = require("chai").expect;
var Core = require("../core.js");
var core = new Core();

describe("Communication Manager", function () {


    describe("#addConnectionListener()", function () {
        it("Should add the connection listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addConnectionListener(function () {

            });

        });
    });

    describe("#addDisconnectionListener()", function () {
        it("Should add the disconnection listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addDisconnectionListener(function () {

            });

        });
    });

    describe("#addReconnectionListener()", function () {
        it("Should add the reconnection listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addReconnectionListener(function () {

            });

        });
    });

    describe("#addSandBoxConnectedListener()", function () {
        it("Should add the new sandbox connected listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addSandBoxConnectedListener(function () {

            });

        });
    });

    describe("#addSandBoxDisconnectedListener()", function () {
        it("Should add the sandbox disconnected listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addSandBoxDisconnectedListener(function () {

            });
        });
    });

    describe("#addJobExecutionResultsListener()", function () {
        it("Should add the job execution results arrival listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addJobExecutionResultsListener(function () {

            });
        });
    });

    describe("#addJobExecutionErrorResultsListener()", function () {
        it("Should add the job execution error listener to the connection manager member", function () {

            var obj = core.getCommunicationManager();
            obj.addJobExecutionResultsListener(function () {

            });
        });
    });
});