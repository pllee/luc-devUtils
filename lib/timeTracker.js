var Luc = require('luc'),
    utils = require('./utils');

module.exports = {
    stampStart: function(id, log, profile) {
        this._initTimes();
        
        if(profile) {
            utils.console.profile(id);
        }

        if (log) {
            utils.console.time(id);
        }
        this._timeStamps[id] = utils.timeStamp();
    },

    _initTimes: function() {
        if (!this._timeStamps) {

            this._timeStamps = {};

            this._totalTimes = {};
        }
    },
    stampEnd: function(id, log, profile) {
        var start = this._timeStamps[id],
            currentRunTime = utils.timeStamp() - start;
        this._trackTime(id, currentRunTime);
        
        if (log) {
            utils.console.timeEnd(id);
        }
        if(profile) {
            utils.console.profileEnd(id);
        }
    },

    _trackTime: function(id, runtime) {
        if (!this._totalTimes[id]) {
            this._totalTimes[id] = {
                iterationsRun: 0,
                totalTime: 0
            };
        }
        this._totalTimes[id].iterationsRun += this._getIterationsToAdd(id);
        this._totalTimes[id].totalTime += runtime;
    },

    _getIterationsToAdd: Luc.abstractFn,

    getReport: function() {
        return this._buildReportObject();
    },

    _buildReportObject: function() {
        var prop, report = {};

        Luc.Object.each(this._totalTimes, function(timeKey, timeObj) {
            report[timeKey] = Luc.apply({}, timeObj);
            report[timeKey].average = timeObj.totalTime / timeObj.iterationsRun;
        });

        return report;
    }
};