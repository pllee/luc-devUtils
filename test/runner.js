var devUtils = require('./testLib'),
    expect = require('expect.js'),
    Runner = devUtils.Runner;

describe('Runner', function() {
    function getReportData(r) {
        var report = r.getReport();
        return report[Object.keys(report)[0]];
    }
    it('configed iterations', function() {
        var iterations = 1000,
            runner = new Runner({
                iterations: iterations,
                functions: function() {}
            });

        runner.run();
        var report = getReportData(runner);

        expect(report.iterationsRun).to.be(iterations);
    });

    it('set iterations', function() {
        var iterations1 = 1000,
            iterations2 = 100,
            runner = new Runner({
                functions: function() {}
            });
        runner.setIterations(iterations1);
        runner.run();
        runner.setIterations(iterations2);
        runner.run();

        var report = getReportData(runner);

        expect(report.iterationsRun).to.be(iterations1 + iterations2);
    });

    it('named function', function() {
        var iterations = 1000,
            name = 'aaa',
            runner = new Runner({
                iterations: 1000,
                functions: {
                    fn: function() {},
                    name: name
                }
            });

        runner.run();

        expect(runner.getReport()[name].iterationsRun).to.be(iterations);
    });

    it('function called number of iterations', function() {
        var iterations = 1000,
            i = 0,
            fn = function(){++i;},
            runner = new Runner({
                iterations: 1000,
                functions: fn
            });

        runner.run();
        runner.run();
        expect(i).to.be(iterations * 2);
    });

    //make sure no ops if needed are used, no errors are throw if not implemented in js engine
    it('profiling', function() {
        (new Runner({
            functions: function(){},
            profile: true
        }).run());
    });

    it('log', function() {
        (new Runner({
            functions: function(){},
            log: true
        }).run());
    });

});