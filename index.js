/* jshint node:true */

'use strict';

var map  = require('map-stream'),
    csso = require('csso'),
    transform = require('stream').Transform,
    bufferstreams = require('bufferstreams'),
    gutil = require ('gulp-util');
var PLUGIN_NAME = 'gulp-csso';

function cssoTransform(optimise) {
    // Returns a callback that handles the buffered content
    return function(err, buffer, cb) {
        if (err) {
            cb(gutil.PluginError(PLUGIN_NAME, err));
        }
        var optimised = csso.justDoIt(String(buffer), optimise);
        cb(null, new Buffer(optimised));
    };
}

function gulpcsso(optimise) {
    var optimise = arguments[0];
    var stream = new transform({ objectMode: true });

    stream._transform = function(file, unused, done) {
        // Pass through if null
        if (file.isNull()) {
            stream.push(file);
            done();
            return;
        }

        if (file.isStream()) {
            file.contents = file.contents.pipe(new bufferstreams(cssoTransform(optimise)));
            stream.push(file);
            done();
        } else {
            var optimised = csso.justDoIt(String(file.contents), optimise);
            file.contents = new Buffer(optimised);
            stream.push(file);
            done();
        }
    };

    return stream;
}

gulpcsso.cssoTransform = cssoTransform;

module.exports = gulpcsso;

/*
module.exports = function() {
    // Use csso(true) to turn structure minimization off.
    var optimise = (arguments.length > 0) ? arguments[0] : false;
    return map(function(file, cb) {
        file.contents = new Buffer(csso.justDoIt(String(file.contents), optimise));
        cb(null, file);
    });
};
*/
