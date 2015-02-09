/**
 * Created by: victor on 1/31/15.
 * Source: connectionManagerSpec.js
 * Author: victor
 * Description: Test File for the Connection Manager file.
 *
 */
var expect = require("chai").expect;
var Core = require("../core.js");
var core = new Core();

describe("Connection Manager", function () {

    var serverURL = "https://wwcl-server-mastayoda1.c9.io";

    describe("#setServerURL()", function () {
        it("Should set the server URL", function () {

            var obj = core.getConnectionManager();
            obj.setServerURL(serverURL);

        });
    });

    describe("#getServerURL()", function () {
        it("Should get the server URL", function () {

            var obj = core.getConnectionManager();
            var url = obj.getServerURL();

            expect(url).to.be.equal(serverURL);
        });
    });

    describe("#getSandBoxMap()", function () {
        it("Should get the sandbox store hash map", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();
            expect(map).to.be.a("object");
        });
    });

    describe("#getSandBoxCount()", function () {
        it("Should get the sandbox counter", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 25, bar: "hello"});

            var count = obj.getSandBoxCount();
            expect(count).to.be.equal(2);
            /* Deleting all values */
            map.clear();
        });
    });

    describe("#hasSandBox()", function () {
        it("Should indicate if the sandbox hash map has the given key", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            expect(obj.hasSandBox(1111)).to.be.equal(false);

            map.set(1111, {foo: 25, bar: "hello"});
            expect(obj.hasSandBox(1111)).to.be.equal(true);

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#getSandBox()", function () {
        it("Should get the sandbox for the given key", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            /* Checking sandbox retrieval */
            map.set(1111, {foo: 25, bar: "hello"});
            expect(obj.getSandBox(1111)).to.deep.equal({foo: 25, bar: "hello"});

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#getSandBoxesKeys()", function () {
        it("Should get an array of the sandbox IDs in the collection", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 25, bar: "hello"});

            expect(obj.getSandBoxesKeys()).to.deep.equal([1111, 2222]);

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#getSandBoxes()", function () {
        it("Should get all sandboxes in the hash map", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            expect(obj.getSandBoxes()).to.deep.equal([{foo: 25, bar: "hello"}, {foo: 30, bar: "bye"}]);

            /* Deleting all values */
            map.clear();
        });
    });
    describe("#sandBoxesToObject()", function () {
        it("Should get an object in the form of ID:sandbox in the form af an big object", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            expect(obj.sandBoxesToObject()).to.deep.equal({
                '1111': {foo: 25, bar: 'hello'},
                '2222': {foo: 30, bar: 'bye'}
            });

            /* Deleting all values */
            map.clear();
        });
    });

    describe("#sandBoxesToJSON()", function () {
        it("Should get a JSON version of the complete hash map content", function () {

            var obj = core.getConnectionManager();

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            expect(obj.sandBoxesToJSON()).to.deep.equal([[1111, {foo: 25, bar: 'hello'}], [2222, {
                foo: 30,
                bar: 'bye'
            }]]);

            /* Deleting all values */
            map.clear();
        });
    });

    describe("#getIDAndSandBoxPairs()", function () {
        it("Should get pairs of each entry in the sandbox hash map", function () {

            var obj = core.getConnectionManager();

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            expect(obj.getIDAndSandBoxPairs()).to.deep.equal([[1111, {foo: 25, bar: 'hello'}], [2222, {
                foo: 30,
                bar: 'bye'
            }]]);

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#mapSandBoxes()", function () {
        it("Should return a mapped array of each sandbox in the hash map", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            /* The given map function takes the 'bar' string property of each sandbox,
             * reverse the string and return it. the result should be an array of each
             * reversed 'bar' content of all sandboxes in the hash map.
             */
            var result = obj.mapSandBoxes(function (sdbx) {
                return sdbx.bar.split("").reverse().join("");
            });

            expect(result).to.deep.equal(['olleh', 'eyb']);

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#filterSandBoxes()", function () {
        it("Should filter the sandboxes and return an array of the those that passed the true or false condition", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});
            map.set(3333, {foo: 35, bar: "here"});
            map.set(4444, {foo: 40, bar: "there"});
            map.set(5555, {foo: 45, bar: "yes"});
            map.set(6666, {foo: 50, bar: "no"});

            /* The given filter function evaluates the 'foo' integer property of each sandbox,
             * and determines if that property modulo 2 is equal to zero (even number), if that is
             * the case, include that sandbox in the final result(filter).
             */
            var result = obj.filterSandBoxes(function (sdbx) {
                return sdbx.foo % 2 === 0;
            });

            expect(result).to.deep.equal([
                [2222, {foo: 30, bar: 'bye'}],
                [4444, {foo: 40, bar: 'there'}],
                [6666, {foo: 50, bar: 'no'}]]);

            /* Deleting all values */
            map.clear();
        });
    });

    describe("#forEachSandBox()", function () {
        it("Should execute the given function upon each sandbox in the hash map", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});

            /* for each sandbox in the map, concatenate the 'bar' string with the 'foo' integer, and
             * reassign the 'bar' property, then reinitialize the 'foo' property to 0.
             */
            obj.forEachSandBox(function (sdbx) {
                sdbx.bar = sdbx.bar + sdbx.foo;
                sdbx.foo = 0;
            });

            expect(obj.getIDAndSandBoxPairs()).to.deep.equal([[1111, {foo: 0, bar: 'hello25'}], [2222, {
                foo: 0,
                bar: 'bye30'
            }]]);

            /* Deleting all values */
            map.clear();
        });
    });

    describe("#groupSandBoxes()", function () {
        it("Should group hash map content by the result of the given function, i.e, a histogram of objects", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});
            map.set(3333, {foo: 35, bar: "here"});
            map.set(4444, {foo: 40, bar: "there"});
            map.set(5555, {foo: 45, bar: "yes"});
            map.set(6666, {foo: 50, bar: "no"});

            /* The given filter function evaluates the 'foo' integer property of each sandbox,
             * and determines if that property modulo 2 is equal to zero (even number), if that is
             * the case, include that sandbox in the final result(filter).
             */
            var result = obj.groupSandBoxes(function (sdbx) {
                return (sdbx.foo % 2 === 0) ? "Even" : "Odd";
            });

            expect(result).to.deep.equal(
                [['Odd', [{foo: 25, bar: "hello"},
                    {foo: 35, bar: "here"},
                    {foo: 45, bar: "yes"}]],
                    ['Even', [{foo: 30, bar: "bye"},
                        {foo: 40, bar: "there"},
                        {foo: 50, bar: "no"}]]]
            );

            /* Deleting all values */
            map.clear();

        });
    });

    describe("#someSandBox()", function () {
        it("Should determine if some sandbox in the hash map fulfill the give function condition", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});
            map.set(2222, {foo: 30, bar: "huehue"});

            var result = obj.someSandBox(function (sdbx) {
                return sdbx.bar == "none";
            });

            expect(result).to.be.equal(false);

            var result = obj.someSandBox(function (sdbx) {
                return sdbx.bar == "huehue";
            });

            expect(result).to.be.equal(true);


            /* Deleting all values */
            map.clear();

        });
    });

    describe("#everySandBox()", function () {
        it("Should determine if all sandboxes in the hash map fulfill the give function condition", function () {

            var obj = core.getConnectionManager();
            var map = obj.getSandBoxMap();

            map.set(1111, {foo: 25, bar: "hello"});
            map.set(2222, {foo: 30, bar: "bye"});
            map.set(2222, {foo: 30, bar: "huehue"});

            var result = obj.someSandBox(function (sdbx) {
                return sdbx.foo < 0;
            });

            expect(result).to.be.equal(false);

            var result = obj.someSandBox(function (sdbx) {
                return sdbx.bar.length >= 3;
            });

            expect(result).to.be.equal(true);


            /* Deleting all values */
            map.clear();

        });
    });


});