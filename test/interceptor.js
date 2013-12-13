var devUtils = require('./testLib'),
    expect = require('expect.js'),
    Interceptor = devUtils.Interceptor;

describe('Interceptor', function() {

    describe('functions config', function() {

        it('before', function() {
            var called = false,
                c = function() {
                    called = true;
                }, obj = {
                    fn: function() {
                        expect(called).to.be(true);
                    }
                };

            var interceptor = new Interceptor({functions: {
                obj: obj,
                fnName: 'fn',
                before: c
            }});

            obj.fn();
        });

        it('after', function() {
            var called = false,
                c = function() {
                    called = true;
                }, obj = {
                    fn: function() {
                        expect(called).to.be(false);
                    }
                };

            var interceptor = new Interceptor({functions: {
                obj: obj,
                fnName: 'fn',
                after: c
            }});

            obj.fn();

            expect(called).to.be(true);
        });
    });

    describe('times config', function() {

        it('getReport', function() {
            var obj = {
                fn: function() {}
            },
                interceptor = new Interceptor({
                    times: {
                        obj: obj,
                        fnName: 'fn'
                    }
                });

            obj.fn();
            obj.fn();
            obj.fn();

            var report = interceptor.getReport(),
                data = report[Object.keys(report)[0]];

            expect(data.iterationsRun).to.be(3);
        });

        it('after', function() {
            var called = false,
                c = function() {
                    called = true;
                }, obj = {
                    fn: function() {
                        expect(called).to.be(false);
                    }
                };

            var interceptor = new Interceptor({functions: {
                obj: obj,
                fnName: 'fn',
                after: c
            }});

            obj.fn();

            expect(called).to.be(true);
        });
    });

    describe('restore', function() {

        it('single config', function() {
            var fn = function(){},
                obj = {fn: fn};

            var interceptor = new Interceptor({times: {
                obj: obj,
                fnName: 'fn'
            }});

            expect(obj.fn).to.not.be(fn);
            interceptor.restore();
            expect(obj.fn).to.be(fn);
        });

        it('multi config', function() {
            var fn = function(){},
                obj = {fn: fn};

            var interceptor = new Interceptor({
                times: [{
                    obj: obj,
                    fnName: 'fn'
                }, {
                    obj: obj,
                    fnName: 'fn'
                }],
                functions: [{
                    obj: obj,
                    fnName: 'fn'
                }, {
                    obj: obj,
                    fnName: 'fn'
                }]
            });

            expect(obj.fn).to.not.be(fn);
            interceptor.restore();
            expect(obj.fn).to.be(fn);
        });
    });

    
});