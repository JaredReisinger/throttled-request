'use strict'

var util = require('util');
var proxyquire = require('proxyquire');

function MockRequest(options) {
    this.init();
}

var initSpy = jasmine.createSpy('initSpy');

MockRequest.prototype.init = function () {
    initSpy();
};

var pseudoRequest = require('request');
pseudoRequest.Request = MockRequest;


describe('throttled-request', function() {
    var throttledRequest = proxyquire('../../lib/index', {
        'request': pseudoRequest,
    });

    it('returns a replacement Request class', function() {
        expect(throttledRequest.Request).not.toBe(MockRequest);
    });

    it('monkey patches the Request class in request', function() {
        expect(pseudoRequest.Request).not.toBe(MockRequest);
        expect(pseudoRequest.Request).toBe(throttledRequest.Request);
    });

    describe('ThrottledRequest class', function() {

        beforeEach(function() {
            initSpy.calls.reset();
            throttledRequest.resetThrottling();
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('doesn\'t delay the first request', function() {
            var req1 = throttledRequest('http://bogus.com/1');

            expect(initSpy).not.toHaveBeenCalled();
            jasmine.clock().tick(1);
            expect(initSpy.calls.count()).toEqual(1);
        });


        it('delays the second request', function() {
            var req1 = throttledRequest('http://bogus.com/1');
            var req2 = throttledRequest('http://bogus.com/2');

            expect(initSpy).not.toHaveBeenCalled();
            jasmine.clock().tick(1);
            expect(initSpy.calls.count()).toEqual(1);
            jasmine.clock().tick(15000);
            expect(initSpy.calls.count()).toEqual(2);
        });
    });
});
