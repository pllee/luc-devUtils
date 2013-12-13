var devUtils = require('./testLib'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    Watcher = devUtils.Watcher,
    addTests = true,
    createWatcher = function(config) {
        var watcher = new Watcher(config);
        watcher._break = function() {};

        return watcher;
    };

try {
    Object.defineProperty({}, 'IE', {});
} catch (e) {
    addTests = false;
}

if (addTests) {
    describe('Watcher', function() {

        describe('instance methods/configs', function() {

            it('break on change', function() {
                var obj = {},
                    property = 'prop';

                obj[property] = true;

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, '_break');

                obj[property] = true;
                expect(spy.callCount).to.be(0);
                obj[property] = false;
                expect(spy.callCount).to.be(1);
                obj[property] = false;
                expect(spy.callCount).to.be(1);
                obj[property] = true;
                expect(spy.callCount).to.be(2);
            });

            it('configed beforeSet', function() {
                var obj = {},
                    property = 'prop',
                    retValue = true,
                    beforeSet = function() {
                        return retValue;
                    };

                var watcher = createWatcher({
                    obj: obj,
                    property: property,
                    beforeSet: beforeSet
                });

                var spy = sinon.spy(watcher, 'beforeSet');

                obj[property] = 'aaa';
                var junk = obj[property];
                junk = obj[property];

                expect(spy.callCount).to.be(1);
                expect(spy.firstCall.returnValue).to.be(retValue);

                obj[property] = 'aaa';

                expect(spy.callCount).to.be(2);
            });

            it('configed beforeGet', function() {
                var obj = {},
                    property = 'prop',
                    retValue = true,
                    beforeGet = function() {
                        return retValue;
                    };

                var watcher = createWatcher({
                    obj: obj,
                    property: property,
                    beforeGet: beforeGet
                });

                var spy = sinon.spy(watcher, 'beforeGet');

                obj[property] = 'aaa';
                obj[property] = 'aaa';

                var junk = obj[property];

                expect(spy.callCount).to.be(1);
                expect(spy.firstCall.returnValue).to.be(retValue);

                junk = obj[property];

                expect(spy.callCount).to.be(2);
            });

            it('beforeSet call args', function() {
                var obj = {},
                    property = 'prop',
                    startValue = 1,
                    firstChange = 2,
                    secondChange = 3;

                obj[property] = startValue;

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, 'beforeSet');

                obj[property] = firstChange;
                obj[property] = secondChange;

                expect(spy.firstCall.args).to.be.eql([firstChange, startValue, obj]);
                expect(spy.secondCall.args).to.be.eql([secondChange, firstChange, obj]);
            });


            it('beforeGet call args', function() {
                var obj = {},
                    property = 'prop',
                    startValue = 1,
                    firstChange = 2;

                obj[property] = startValue;

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, 'beforeGet');

                var get = obj[property];

                obj[property] = firstChange;

                get = obj[property];

                expect(spy.firstCall.args).to.be.eql([startValue, obj]);
                expect(spy.secondCall.args).to.be.eql([firstChange, obj]);
            });

            it('restore', function() {
                var obj = {},
                    property = 'prop',
                    firstValue = true;

                obj[property] = firstValue;

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, 'beforeSet');


                watcher.restore();

                var get = obj[property];

                get = obj[property];

                expect(spy.callCount).to.be(0);
                expect(obj[property]).to.be(firstValue);
            });

            it('beforeSet', function() {
                var obj = {},
                    property = 'prop',
                    firstValue = true;

                obj[property] = firstValue;

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, 'beforeSet');


                watcher.restore();

                var get = obj[property];

                get = obj[property];

                expect(spy.callCount).to.be(0);
                expect(obj[property]).to.be(firstValue);
            });

            it('pausing', function() {
                var obj = {},
                    property = 'prop';

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, '_break');

                obj[property] = true;

                expect(spy.callCount).to.be(1);

                watcher.pause();

                obj[property] = false;

                expect(spy.callCount).to.be(1);

                watcher.resume();

                obj[property] = true;

                expect(spy.callCount).to.be(2);
            });

            it('doBreakIf', function() {
                var obj = {},
                    property = 'prop';

                var watcher = createWatcher({
                    obj: obj,
                    doBreakIf: function(val1, val2) {
                        //do break if there is two trues in a row
                        if (val2 !== undefined) {
                            return val1 === true && val2 === true;
                        }
                        return true;
                    },
                    property: property
                });

                var spy = sinon.spy(watcher, '_break');

                obj[property] = true;

                expect(spy.callCount).to.be(1);

                obj[property] = true;
                expect(spy.callCount).to.be(2);

                obj[property] = true;
                expect(spy.callCount).to.be(3);

                obj[property] = false;
                obj[property] = true;

                expect(spy.callCount).to.be(3);
            });

            it('doBreak false', function() {
                var obj = {},
                    property = 'prop';

                var watcher = createWatcher({
                    obj: obj,
                    doBreak: false,
                    property: property
                });

                var spy = sinon.spy(watcher, '_break');

                obj[property] = true;

                expect(spy.callCount).to.be(0);
            });
        });

        describe('static methods', function() {

            it('pause/resume all', function() {
                var obj = {},
                    property = 'prop';

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                Watcher.pauseAll();
                expect(watcher.isPaused()).to.be(true);
                Watcher.resumeAll();
                expect(watcher.isPaused()).to.be(false);
            });

            it('restoreAll', function() {
                var obj = {},
                    property = 'prop';

                var watcher = createWatcher({
                    obj: obj,
                    property: property
                });

                var spy = sinon.spy(watcher, '_break');
                
                Watcher.restoreAll();
                obj[property] = true;
                expect(spy.callCount).to.be(0);
                expect(Watcher.getAll()).to.be.eql([]);
            });

        });

    });
}