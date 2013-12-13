var Luc = require('luc'),
    TimeTracker = require('./timeTracker'),
    utils = require('./utils');

/**
 * @class Luc.devUtils.Interceptor
 * Intercepts methods on objects to add time info or console logs or functions.
 *
    
    var interceptor = new Luc.devUtils.Interceptor({
        logs: {
            obj: Luc.devUtils.Runner.prototype,
            fnName: 'run',
            before: 'running ...',
            after: function(f) {
                return 'first call arg ' + f;
            }
        },
        times: [{
            obj: Luc.devUtils.Runner.prototype,
            fnName: 'run'
        }],
        functions: {
            obj: Luc.devUtils.Runner.prototype,
            fnName: 'run',
            before: function() {
                window.alert('running ....')
            }
        }
    }),
    v = new Luc.devUtils.Runner({
        // .....
    });

    * v.run('a') would output something like
    
    running ...
    first call arg a
    //This is from the times
    run: 14.539ms

    *interceptor.getReport() would output something like:
    
    { run:
        {"iterationsRun":1,"totalTime":14.53899999614805,"average":14.53899999614805}
    }
    
    *after calling interceptor.restore()
    * the methods will be restored back to their original states.
 */

module.exports = Luc.define({
    $mixins: TimeTracker,

    /**
     * @cfg {Object/Object[]} logs
     * An object or array of objects with the following properties
     * @cfg {Object} logs.obj (required) the object that has the function to show logs.
     * @cfg {String} logs.fnName (required) the name of the function to show logs.
     * @cfg {String|Function} [logs.before] the console output to log before the function is called.
     * @cfg {String|Function} [logs.after] the console output to log after the function is called.
     * @cfg {Boolean} [logs.logResult] true to log the return value of the function.
     *
     *For example this would log <br>
      
        "running .." before run is called <br>
     * and <br>
     
        "first call arg : undefined" <br>
    
     *after run is called
     
     logs : {
        fnName: 'run',
        obj: Luc.devUtils.Runner.prototype,
        before: 'running ...',
        after: function() {
            return 'first call arg' + arguments[0];
        }
     }

     */

    /**
     * @cfg {Object/Object[]} times
     * An object or array of objects with the following properties
     * @cfg {Object} times.obj (required) the object that has the function to track time.
     * @cfg {String} times.fnName  (required) the name of the function to track time.
     * @cfg {Boolean} [times.logResult] true to log the return value of the function.
     * @cfg {Boolean} [times.profile] true to invoke profiling if supported by the browser/node.
     * @cfg {Boolean} [times.log] true log time statements when the function is called.
     */

    /**
     * @cfg {Object/Object[]} functions
     * An object or array of objects with the following properties
     * @cfg {Object} functions.obj (required) the object with the function to override.
     * @cfg {String} functions.fnName (required) the name of the function.
     * @cfg {Function} [functions.before] function to call before the original function has been called.
     * @cfg {Function} [functions.after] function to call after the original function has been called.
     * @cfg {Boolean} [functions.logResult] true to log the return value of the function.
     */

    init: function(config) {
        this._restoreFns = [];
        this._initLogs();
        this._initTimeLogs();
        this._initFunctions();
    },

    _initLogs: function() {
        Luc.Array.each(this.logs, function(interceptConfig) {
            this._intercept(this._createLogInterceptConfig(interceptConfig));
        }, this);
    },

    _createLogInterceptConfig: function(c) {
        return Luc.mix({
            before: this._logToFn(c.before),
            after: this._logToFn(c.after)
        }, c);
    },

    _logToFn: function(stringOrFn) {
        var fn = Luc.emptyFn;

        if (Luc.isFunction(stringOrFn)) {
            fn = function() {
                utils.console.log(stringOrFn.apply(this, arguments));
            };
        } else if (stringOrFn !== undefined) {
            fn = function() {
                utils.console.log(stringOrFn);
            };
        }

        return fn;
    },

    _initTimeLogs: function() {
        Luc.Array.each(this.times, function(config) {
            var id = config.fnName + '_' + Luc.id('');
            this._intercept(this._createTimeConfig(config, id));
        }, this);
    },

    _createTimeConfig: function(cfg, id) {
        var me = this;
        return Luc.apply(cfg, {
            before: function() {
                me.stampStart(id, cfg.log, cfg.profile);
            },
            after: function() {
                me.stampEnd(id, cfg.log, cfg.profile);
            }
        });
    },

    _initFunctions: function() {
        Luc.Array.each(this.functions, function(functionConfig) {
            this._intercept(this._createFunctionInterceptConfig(functionConfig));
        }, this);
    },

    _createFunctionInterceptConfig: function(c) {
        return Luc.apply({
            before: Luc.emptyFn,
            after: Luc.emptyFn
        }, c);
    },

    _intercept: function(interceptConfig) {
        var obj = interceptConfig.obj,
            fnName = interceptConfig.fnName,
            oldFn = obj[fnName],
            before = interceptConfig.before,
            after = interceptConfig.after,
            logResult = interceptConfig.logResult;


        obj[fnName] = function() {
            var result;

            before.apply(this, arguments);

            result = oldFn.apply(this, arguments);

            if (logResult) {
                utils.console.log(result);
            }

            after.apply(this, arguments);

            return result;
        };

        this._restoreFns.unshift(function() {
            obj[fnName] = oldFn;
        });
    },
    /**
     * @method
     * Restore the intercepted function(s) back to their original
     * states.
     */
    restore: function() {
        this._restoreFns.forEach(function(fn) {
            fn();
        }, this);
    },

    //@implement
    _getIterationsToAdd: function() {
        return 1;
    }

    /**
     * @method getReport
     * Returns the time info for functions the
     * run, they are keyed off by function name.  The time
     * info will may vary slightly from the console.time output.
     * This will only show info if {@link Luc.devUtils.Interceptor#times times } are defined.
     * @return {Object}
     */
});
