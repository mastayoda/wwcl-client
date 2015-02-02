/**
 * Created by: victor on 1/31/15.
 * Source: examples.js
 * Author: victor
 * Description: Test File for the Main Core file.
 *
 */
var expect = require("chai").expect;

describe("Examples", function () {
    describe("#All Chain Functions", function () {
        it("should pass all chain examples", function () {


            /* .not */
            expect({foo: 'baz'}).to.not.equal('bar');
            expect(function () {
            }).to.not.throw(Error);
            expect({foo: 'baz'}).to.have.property('foo').and.not.equal('bar');

            /* deep */
            expect({foo: 'baz'}).to.deep.equal({foo: 'baz'});
            expect({foo: {bar: {baz: 'quux'}}}).to.have.deep.property('foo.bar.baz', 'quux');

            /* .a(type) */
            expect('test').to.be.a('string');
            expect({foo: 'bar'}).to.be.an('object');
            expect(null).to.be.a('null');
            expect(undefined).to.be.an('undefined');

            /* .include(value) */
            expect([1, 2, 3]).to.include(2);
            expect('foobar').to.contain('foo');
            expect({foo: 'bar', hello: 'universe'}).to.include.keys('foo');

            /* .ok  */
            expect('everthing').to.be.ok();
            expect(1).to.be.ok();
            expect(false).to.not.be.ok();
            expect(undefined).to.not.be.ok();
            expect(null).to.not.be.ok();

            /* .true */
            expect(true).to.be.true();
            expect(1).to.not.be.true();

            /* .false */
            expect(false).to.be.false();
            expect(0).to.not.be.false();

            /* .null */
            expect(null).to.be.null();
            expect(undefined).not.to.be.null();

            /* .undefined */
            expect(undefined).to.be.undefined();
            expect(null).to.not.be.undefined();

            /* .exist */
            var foo = 'hi'
                , bar = null
                , baz;

            expect(foo).to.exist();
            expect(bar).to.not.exist();
            expect(baz).to.not.exist();

            /* .empty */
            expect([]).to.be.empty();
            expect('').to.be.empty();
            expect({}).to.be.empty();

            /* .equal(value) */
            expect('hello').to.equal('hello');
            expect(42).to.equal(42);
            expect(1).to.not.equal(true);
            expect({foo: 'bar'}).to.not.equal({foo: 'bar'});
            expect({foo: 'bar'}).to.deep.equal({foo: 'bar'});

            /* .eql(value) */
            expect({foo: 'bar'}).to.eql({foo: 'bar'});
            expect([1, 2, 3]).to.eql([1, 2, 3]);

            /* .above(value) */
            expect(10).to.be.above(5);
            expect('foo').to.have.length.above(2);
            expect([1, 2, 3]).to.have.length.above(2);

            /* .least(value) */
            expect(10).to.be.at.least(10);
            expect('foo').to.have.length.of.at.least(2);
            expect([1, 2, 3]).to.have.length.of.at.least(3);

            /* .below(value) */
            expect(5).to.be.below(10);
            expect('foo').to.have.length.below(4);
            expect([1, 2, 3]).to.have.length.below(4);

            /* .most(value) */
            expect(5).to.be.at.most(5);
            expect('foo').to.have.length.of.at.most(4);
            expect([1, 2, 3]).to.have.length.of.at.most(3);

            /* .within(start, finish) */
            expect(7).to.be.within(5, 10);
            expect('foo').to.have.length.within(2, 4);
            expect([1, 2, 3]).to.have.length.within(2, 4);

            /* .instanceof(constructor) */
            var Tea = function (name) {
                    this.name = name;
                }
                , Chai = new Tea('chai');

            expect(Chai).to.be.an.instanceof(Tea);
            expect([1, 2, 3]).to.be.instanceof(Array);

            /* .property(name, [value]) */
            // simple referencing
            var obj = {foo: 'bar'};
            expect(obj).to.have.property('foo');
            expect(obj).to.have.property('foo', 'bar');

            // deep referencing
            var deepObj = {
                green: {tea: 'matcha'}
                , teas: ['chai', 'matcha', {tea: 'konacha'}]
            };

            expect(deepObj).to.have.deep.property('green.tea', 'matcha');
            expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
            expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');

            var arr = [
                ['chai', 'matcha', 'konacha']
                , [{tea: 'chai'}
                    , {tea: 'matcha'}
                    , {tea: 'konacha'}]
            ];

            expect(arr).to.have.deep.property('[0][1]', 'matcha');
            expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
            expect(obj).to.have.property('foo').that.is.a('string');
            expect(deepObj).to.have.property('green').that.is.an('object').that.deep.equals({tea: 'matcha'});
            expect(deepObj).to.have.property('teas').that.is.an('array').with.deep.property('[2]').that.deep.equals({tea: 'konacha'});

            /*.ownProperty(name) */
            expect('test').to.have.ownProperty('length');

            /* .length(value) */
            expect([1, 2, 3]).to.have.length(3);
            expect('foobar').to.have.length(6);
            expect('foo').to.have.length.above(2);
            expect([1, 2, 3]).to.have.length.above(2);
            expect('foo').to.have.length.below(4);
            expect([1, 2, 3]).to.have.length.below(4);
            expect('foo').to.have.length.within(2, 4);
            expect([1, 2, 3]).to.have.length.within(2, 4);

            /* .match(regexp) */
            expect('foobar').to.match(/^foo/);

            /* .string(string) */
            expect('foobar').to.have.string('bar');

            /* .keys(key1, [key2], [...]) */
            expect({foo: 1, bar: 2}).to.have.keys(['foo', 'bar']);
            expect({foo: 1, bar: 2, baz: 3}).to.contain.keys('foo', 'bar');

            /* .satisfy(method) */
            expect(1).to.satisfy(function (num) {
                return num > 0;
            });

            /* .closeTo(expected, delta) */
            expect(1.5).to.be.closeTo(1, 0.5);

            /* .members(set) */
            expect([1, 2, 3]).to.include.members([3, 2]);
            expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
            expect([4, 2]).to.have.members([2, 4]);
            expect([5, 2]).to.not.have.members([5, 2, 1]);
            expect([{id: 1}]).to.deep.include.members([{id: 1}]);

        });
    });
});