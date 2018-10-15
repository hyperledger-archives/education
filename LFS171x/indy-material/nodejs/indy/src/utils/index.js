'use strict';

exports.sleep = function(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms)
    })
};