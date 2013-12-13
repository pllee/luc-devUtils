[![Luc](http://pllee.github.io/luc/pages/docsResources/luc.png)](https://github.com/pllee/luc) -devUtils
====

[![Build Status](https://secure.travis-ci.org/pllee/luc-devUtils.png)](http://travis-ci.org/pllee/luc)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/luc-devUtils.svg)](https://saucelabs.com/u/luc-devUtils)


Luc Developer Utils
====

Performance, debugging and other utilities that can help with JavaScript development.


Node
====
npm install luc-devUtils

Browser
====
[Download](http://pllee.github.io/luc-devUtils/versions/luc-devUtils-0.1.0.zip) the latest zip or check out the hosted build files [luc-devUtils](http://pllee.github.io/luc-devUtils/build/luc-devUtils.js), [luc-devUtils-es5-shim](http://pllee.github.io/luc-devUtils/build/luc-devUtils-es5-shim.js).  Source maps come packaged with the non minified versions.

[Luc.devUtils.Watcher](http://pllee.github.io/luc-devUtils/pages/docs/#!/api/Luc.devUtils.Watcher)
===
Cross browser break on change functionality.  THIS ONLY WORKS ON ES5 BROWSERS (more specifically ones that implement Object.defineProperty).  
No errors will be thrown in older browsers.  <br>
It also has a few hooks that can be useful for debugging conditional  get/set operations.
The default behavior is to invoke the debugger if the value has changed.

```js
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
```
That is the default behavior of watcher.  @protected hooks can be overwritten for added functionality.

```js
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
```

```js
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
```

```js
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
```

There are also some static convenience methods so you can manage all of your Watcher instances.

```js
    //pause all instances
    Luc.devUtils.Watcher.pauseAll();

    //resume all instances
    Luc.devUtils.Watcher.resumeAll();

    //restore all instances
    Luc.devUtils.Watcher.restoreAll();
```


[Luc.devUtils.Interceptor](http://pllee.github.io/luc-devUtils/pages/docs/#!/api/Luc.devUtils.Interceptor)
===
Intercepts methods on objects to add time info or console logs or functions that will get called before and after the intercepted method is called.  Info on functions can be obtained without putting log statements in your source code or libraries.  Time logs keep track of how many times a function has been called and how long it has run for.  When put on the prototype of a class this can be useful information to have without having to dig through and have the overhead of a profiler.  Functions can be used to add a quick breakpoint on a child class instead of doing a conditional breakpoint of:

```js
this instanceof Child
```

Sample usage:

```js
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
        log: false,
        // .....
    });
```

v.run('a') would output something like

```js
running ...
first call arg a 
//This is from the times
run: 14.539ms 
```

interceptor.getReport() would output something like:

```js
{ run:
    {"iterationsRun":1,"totalTime":14.53899999614805,"average":14.53899999614805}
}
```

[Luc.devUtils.Runner](http://pllee.github.io/luc-devUtils/pages/docs/#!/api/Luc.devUtils.Runner)
===

Runs a set of functions for n number of iterations and keeps time info on the set of functions.  This can be used for getting time comparisons. 

Sample usage:

```js
var arr = [1,2 3],
runner = new Luc.devUtils.Runner({
    //defaults to true
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
```
would show console.time outputs to the console like:

```js
nativeForEach: 7.304ms 
Luc Each: 8.032ms 
forLoop: 0.796ms
```

after calling run 2 more times runner.getReport() would return something like:

```js
{
    "nativeForEach": {
        "iterationsRun": 30000,
        "totalTime": 13.921000011090655,
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
```
