'use strict';

var util = require('util');

// We're going to end up monkey-patching the request.Request object/class,
// so we default to *no* throttling.  Consumers will need to use
// `request.defaults()` to create a throttling requester.
var defaultThrottleWindow = 0;   // 10-second default
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


function patchRequest(request) {
    var Request = request.Request;

    // The Request object only has one easy place to interrupt the timing of its normal
    // operation: during the `init()` call.  We can't delay the constructor, because
    // consumers expect to be able to hook events immediately after creation.  We
    // can't hook `start()`, because code within request assumes that it's synchronous
    // and carries on assuming its done its job.  The only place I've found is in `init()`
    // (called from the constructor), where we can override the call and delay it until
    // we actually want the request to occur.
    util.inherits(ThrottledRequest, Request);

    function ThrottledRequest(options) {
        // calculate the time this request can really start.
        var throttleWindow = options.throttleWindow || defaultThrottleWindow;
        if (throttleWindow) {
            this.startTime = claimNextOpportunity(options.throttleWindow || defaultThrottleWindow);
        }

        // let `Request`s default constructor run, which will set up the prototypal
        // inheritence, and eventually call `init()`.
        ThrottledRequest.super_.call(this, options);
    }

    ThrottledRequest.prototype.init = function (options) {
        var realInit = ThrottledRequest.super_.prototype.init;

        if (this.startTime) {
            var now = Date.now();
            var delay = this.startTime - now;

            // The heavy lifting happens in `Request`... we just cause it to happen
            // later than it would normally.
            setTimeout(realInit.bind(this), delay, options);
        } else {
            // If we have no explicit `startTime`, fall back to the underlying
            // init immediately.
            realInit.call(this, options);
        }
    };

    // Monkey-patch `request.Request` so that it uses our new ThrottledRequest object
    // instead.  This will ensure that all request methods (request(), request.get(),
    // request.post(), request.defaults(), etc.) use the throttled request semantics.
    // This is particularly useful in the case of `request.defaults()`, because you
    // can set up a default throttle window for all of your requests to use.
    request.Request = ThrottledRequest;
    request.resetThrottling = resetThrottling;

    return request;
}


module.exports = patchRequest;
