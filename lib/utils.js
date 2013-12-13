var Luc = require('luc'),
    counsell = require('counsell');


exports.timeStamp = (typeof performance !== 'undefined' && performance.now) ?
    function() {
        return performance.now();
} : function() {
    return new Date().getTime();
};

exports.console = counsell;