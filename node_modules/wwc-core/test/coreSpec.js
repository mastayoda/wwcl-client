/**
 * Created by: victor on 1/31/15.
 * Source: coreSpec.js
 * Author: victor
 * Description: Test File for the Main Core file.
 *
 */
var expect = require("chai").expect;
var Core = require("../core.js");
var core = new Core();

describe("Core", function () {

    describe("#Core Property Count", function () {
        it("should have 9 properties", function () {

            var results = Object.keys(core).length;
            /* Validation */
            expect(results).to.be.equal(9);

        });
    });

    describe("#getCommunicationManager()", function () {
        it("should return the communication manager object", function () {

            var results = core.getCommunicationManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });

    describe("#getFaultManager()", function () {
        it("should return the fault manager object", function () {

            var results = core.getFaultManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getJobManager()", function () {
        it("should return the job manager object", function () {

            var results = core.getJobManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getMetricsManager()", function () {
        it("should return the metrics manager object", function () {

            var results = core.getMetricsManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getFileSystemManager()", function () {
        it("should return the system manager object", function () {

            var results = core.getFileSystemManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getSchedulerManager()", function () {
        it("should return the scheduler manager object", function () {

            var results = core.getSchedulerManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getDeploymentManager()", function () {
        it("should return the deployment manager object", function () {

            var results = core.getDeploymentManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
    describe("#getConfigurationManager()", function () {
        it("should return the configuration manager object", function () {

            var results = core.getConfigurationManager();

            /* Validation */
            expect(results).to.not.be.equal(null);
            expect(results).to.not.be.equal(undefined);
            expect(results).to.be.an('object');

        });
    });
});