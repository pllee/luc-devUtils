var Luc = require('luc'),
    TimeTracker = require('./timeTracker');

/**
 * @class Luc.devUtils.Runner
 * Runs a set of functions for <b>n</b> number of iterations
 * and keeps time info on the set of functions.
    
    var arr = [1,2 3],
    runner = new Luc.devUtils.Runner({
        log: true,
        iterations: 10000,
        functions: [{
            fn: function() {
                var a;
                arr.forEach(function(value, index) {
                    a = value + index;
                });
            },
            name: 'nativeForEach'
        }, {
            fn: function() {
                var a;
                Luc.Array.each(arr, function(value, index) {
                    a = value + index;
                });
            },
            name: 'Luc Each'
        }, {
            fn: function() {
                var a, i = 0,
                    len = arr.length
                for(; i < len; ++i) {
                    a = arr[i] + i;
                }
            },
            name: 'forLoop'
        }]
    });

    runner.run();
    * would show console.time outputs to the console like:
    
    nativeForEach: 7.304ms
    Luc Each: 8.032ms
    forLoop: 0.796ms
    
    *after calling run 2 more times runner.getReport() would return something like:
    
    {
        "nativeForEach": {
            "iterationsRun": 30000,
            "totalTime": 24.921000011090655,
            "average": 0.0008307000003696885
        },
        "Luc Each": {
            "iterationsRun": 30000,
            "totalTime": 14.927000003808644,
            "average": 0.0004975666667936215
        },
        "forLoop": {
            "iterationsRun": 30000,
            "totalTime": 1.0809999948833138,
            "average": 0.00003603333316277712
        }
    }
 */
module.exports = Luc.define({
    $mixins: TimeTracker,
    /**
     * @cfg {Number} iterations
     * The number of iterations for the function(s) to run.
     */
    iterations: 10,

    /**
     * @cfg {Boolean} profile 
     * Set to true to invoke profiling if supported by the browser/node.
     */
    profile: false,

    /**
     * @cfg {Function/ Function[]/ Object/ Object[]} functions (required)
     * Functions can either be functions or objects in the form of :
     * @cfg {String}  [functions.name] the identifier name for the function
     * @cfg {Function} functions.fn (required) the function to call
     
     functions: {
            fn: function() {
                var a,
                    arr = [1,2,3];

                arr.forEach(function(value, index) {
                    a = value + index;
                });
            },
            name: 'forEach'
        }
    *this is also a valid config:
     functions: [function(){return 1;}, function(){return 2;}]
     */
    /**
     * @cfg {Boolean} log
     * true to output console.time info
     */
    log: false,

    /**
    * @method run
    * Runs the configured functions for the configured amount
    * of iterations.  If log is true it will output console.time info
    */
    run: function() {
        Luc.Array.each(this.functions, function(functionOrObj, index) {
            var name = functionOrObj.name,
                fn;

            if (name) {
                fn = functionOrObj.fn || functionOrObj;
            } else {
                name = 'index:' + index;
                fn = functionOrObj;
            }

            this._runFunction(fn, name);

        }, this);
    },

    _runFunction: function(fn, name) {
        this.stampStart(name, this.log, this.profile);
        this._runFunctionForIterations(fn);
        this.stampEnd(name, this.log, this.profile);
    },

    _runFunctionForIterations: function(fn) {
        var iterations = this.iterations,
            i = 0;
        for (; i < iterations; ++i) {
            fn();
        }
    },

    /**
     * Set the amount of iterations to run.
     * @param {Number} iterations
     */
    setIterations: function(iterations) {
        this.iterations = iterations;
    },

    /**
     * Set log to true to show console log outputs.
     * @param {Boolean} log
     */
    setLog: function(log) {
        this.log = log;
    },

    /**
     * Set profile to true keep profiling information.
     * @param {Boolean} log
     */
    setProfile: function(value) {
        this.profile = value;
    },


    //@implement
    _getIterationsToAdd: function() {
        return this.iterations;
    }

    /**
     * @method getReport
     * Returns the time info for functions the
     * run, they are keyed off by function name.  The time
     * info will may vary slightly from the console.time output.
     * @return {Object}
     */
});
