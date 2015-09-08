'use strict';

var util = require('util');
var request = require('request');
var Request = request.Request;

var defaultThrottleWindow = 15000;   // 15-second default
var nextOpportunity;

function claimNextOpportunity(throttleWindow) {
    var now = Date.now();

    if (!nextOpportunity || nextOpportunity < now) {
        // request immediately
        nextOpportunity = now;
    }

    var claimed = nextOpportunity;
    nextOpportunity += throttleWindow;

    return claimed;
}

function resetThrottling() {
    nextOpportunity = undefined;
}

// The Request object only has one easy place to interrupt the timing its normal
// operation: during the `init()` call.  We can't delay the constructor, because
// consumers expect to be able to hook events immediately after creation.  We
// can't hook `start()`, because code within request assumes that it's synchronous
// and carry on assuming it's done its job.  The only place I've found is in `init()`
// (called from the constructor), where we can capture the call and delay it until
// we actually want the request to occur.
function ThrottledRequest(options) {
    // calculate the time this request can really start.
    this.startTime = claimNextOpportunity(options.throttleWindow || defaultThrottleWindow);

    // let `Request`s default constructor run, which will set up the prototypal
    // inheritence, and eventually call `init()`.
    ThrottledRequest.super_.call(this, options);
}

util.inherits(ThrottledRequest, Request);

// Override `Request.init()` to delay the actual request until the allowed
// start time.
ThrottledRequest.prototype.init = function (options) {
    var now = Date.now();
    var delay = this.startTime - now;

    // The heavy lifting happens in `Request`... we just cause it to happen
    // later than it would normally.
    setTimeout(ThrottledRequest.super_.prototype.init.bind(this), delay, options);
};

// Monkey-patch request.Request so that it uses our new ThrottledRequest object
// instead.  This will ensure that all request methods (request(), request.get(),
// request.post(), request.defaults(), etc.) use the throttled request semantics.
// This is particularly useful in the case of `request.defaults()`, because you
// can set up a default throttle window for all of your requests to use.
request.Request = ThrottledRequest;
request.resetThrottling = resetThrottling;

module.exports = request;
