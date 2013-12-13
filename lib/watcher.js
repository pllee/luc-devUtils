var Luc = require('luc'),
    emptyFn = Luc.emptyFn,
    _watchers = [],
    _callAll = function(methodName) {
        _watchers.forEach(function(watcher) {
            watcher[methodName]();
        });
    },
    _addStatic = function(watcher) {
        _watchers.push(watcher);
    },
    _removeStatic = function(watcher) {
        Luc.Array.removeFirst(_watchers, watcher, {
            type: 'strict'
        });
    };

/**
 * @class Luc.devUtils.Watcher
 * Cross browser break on change functionality.  THIS ONLY WORKS ON ES5 BROWSERS (more specifically ones that implement Object.defineProperty).  
 * No errors will be thrown in older browsers.  <br>
 * 
 * It also has a few hooks that can be useful for debugging conditional  get/set operations.
 * The default behavior is to invoke the debugger if the value has changed.
 *
    var obj = {},
    watcher = new Luc.devUtils.Watcher({obj: obj, property: 'str'});

    obj.str = 'something';
    //debugger will pop up by default
    watcher.pause();
    obj.str = 'somethingelse';
    //nothing happens

    watcher.resume();
    obj.str = 'something'
    //debugger pops up again

    watcher.restore();
    //obj watchers are restored obj.str = '' doesn't do anything

 *
 * That is the default behavior of Watcher.  Protected hooks can be overwritten for added functionality.   Check protected in the show dropdown on the right to see all of the hooks.
  
    //just log the value when the obj is accessed
    var obj = {num: 1},
        watcher = new Luc.devUtils.Watcher({
            obj: obj,
            property: 'num',
            doBreak: false,
            beforeGet: function(val) {
                console.log(val)
            }
        });

    obj.num++
    > 1
    obj.num++
    > 2

    *<br>
    
    //only break when the error property is set to true
    var obj = {error: false},
        watcher = new Luc.devUtils.Watcher({
            obj: obj,
            property: 'error',
            doBreakIf: function(newValue, oldValue) {
                return newValue === true;
            }
        });

    obj.error = 'something';
    obj.error = true;
    //debuger shows

    *<br>
    *
    // just log the value being set
    var obj = {str: ''},
    watcher = new Luc.devUtils.Watcher({
        obj: obj,
        property: 'str',
        doBreak: false,
        beforeSet: function(value) {
            console.log('setting to ' + value);
        }
    });

    obj.str = 'something';
    >setting to something
    obj.str = 'something else';
    >setting to something else

    *
    * There are also some static convenience methods so you can manage all of your Watcher instances.
    * 
    //pause all instances
    Luc.devUtils.Watcher.pauseAll();

    //resume all instances
    Luc.devUtils.Watcher.resumeAll();

    //restore all instances
    Luc.devUtils.Watcher.restoreAll();

 */
module.exports = Luc.define({

    $statics: {
        getAll: function() {
            return _watchers;
        },
        /**
         * @static
         * pause all watcher instances
         */
        pauseAll: function() {
            _callAll('pause');
        },
        /**
         * @static
         * resume all watcher instances
         */
        resumeAll: function() {
            _callAll('resume');
        },
        /**
         * @static
         * restore all watcher instances
         */
        restoreAll: function() {
            _watchers.slice().forEach(function(watcher) {
                watcher.restore();
            });
        }

    },

    init: function() {
        this._validate();
        this._defineProperty();
        _addStatic(this);
    },

    _validate: function() {
        if (!this.obj) {
            throw new Error('obj must be defined');
        }
        if (!this.property) {
            throw new Error('property must be defined');
        }
    },

    _defineProperty: function() {
        var obj = this.obj,
            property = this.property,
            me = this,
            value = obj[property];

        Object.defineProperty(obj, property, {
            configurable: true,
            get: function() {
                me.beforeGet(value, this);
                return value;
            },
            set: function(newValue) {
                me.beforeSet(newValue, value, this);
                if(me.doBreak) {
                    me.doBreak(newValue, value, this);
                }
                value = newValue;
            }
        });
    },

    /**
     * @protected
     * Defaults to return true if the values are not strictly 
     * equal to each other.  Function to call to determine if a debugger is called.
     * Return true to call the debugger.
     * 
     * @param  {Object} newValue
     * @param  {Object} oldValue
     * @param  {Object} obj
     */
    doBreakIf: function(newValue, oldVal) {
        return newValue !== oldVal;
    },

    /**
     * @protected
     * Function that is called before the value is set that has the default
     * debugger logic.  Set to false to automatically disable the debugger logic.
     * 
     * @param  {Object} newValue
     * @param  {Object} oldValue
     * @param  {Object} obj
     */
    doBreak: function() {
        if (!this._paused && this.doBreakIf.apply(this, arguments)) {
              this._break();
        }
    },

    _break: function() {
        debugger;
    },

    /**
     * Defaults to Luc.emptyFn
     * @protected
     * 
     * Function that gets called when the obj property is set.
     * 
     * @param  {Object} newValue
     * @param  {Object} oldVal
     * @param  {Object} obj
     */
    beforeSet: emptyFn,

    /**
     * @protected
     * Defaults to Luc.emptyFn
     * 
     * Function that gets called when the obj property is accessed.
     * 
     * @param  {Object} value
     * @param  {Object} obj
     */
    beforeGet: emptyFn,

    /**
     * By default stop the debugger statement from ever being called.
     */
    pause: function() {
        this._paused = true;
    },

    /**
     * Resume a pause.
     */
    resume: function() {
        this._paused = false;
    },

    isPaused: function() {
        return this._paused;
    },

    /**
     * Remove all hooks on the obj defined by the Watcher.
     */
    restore: function() {
        var obj = this.obj,
            property = this.property,
            value = obj[property];

        Object.defineProperty(obj, property, {value: value});
        _removeStatic(this);
    }
}, function(Watcher) {
    //do a try catch here some browsers you can guess which one
    //work with only dom objects.
    try {
        Object.defineProperty({}, 'IE', {});
    }
    catch(e) {
        //it is well documented that this won't work in non Object.define 
        //browsers, lets be silent and not fail
        Watcher.prototype.init = emptyFn;
    }
});