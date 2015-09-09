# throttled-request

A rate-limited wrapper around request.

[![npm version](https://img.shields.io/npm/v/throttled-request
.svg)](https://travis-ci.org/JaredReisinger/throttled-request)
[![build status](https://img.shields.io/travis/JaredReisinger/throttled-request/master.svg)](https://travis-ci.org/JaredReisinger/throttled-request)
[![code coverage](https://img.shields.io/codecov/c/github/JaredReisinger/throttled-request.svg)](https://travis-ci.org/JaredReisinger/throttled-request)
[![dependencies](https://img.shields.io/david/JaredReisinger/throttled-request.svg)](https://travis-ci.org/JaredReisinger/throttled-request)


----

Interrupts [request](https://www.npmjs.com/package/request)s normal flow of operations by limiting the rate at which new requests can be made.  Unlike other generic-function-throttling modules, this does not drop calls on the floor... all requests will _eventually_ be made.

This was written to assist in limiting web-crawling behavior; it's assumed that slowing down the requests will also slow down the discovery of new URLs.  It was _not_ designed to simply be given hundreds of URLs an ensure that the process doesn't exit until everything's been fetched; you're responsible for your own process management in that case.


### Usage

Rather than pulling [request](https://www.npmjs.com/package/request) in as a direct dependecy, you'll need to "inject" it into throttled-request as a parameter.  Further, because this monkey-patches the regular export from the `request` module, you _still_ won't get throttling.  You also have to either pass in a `throttleWindow` options property for each request or (more commonly) use `request.defaults()` to create a requestor that always provides a sensible default value:

```javascript
var throttledRequest = require('throttled-request')(require('request'));
var request = throttledRequest.defaults({ throttleWindow: 10000 });
```

Once you've done that, you can use the new request function just as you always did:

```javascript
var throttledRequest = require('throttled-request')(require('request'));
var request = throttledRequest.defaults({ throttleWindow: 10000 });

// treat `request` just as you always did... it's just throttled now!
var req1 = request('http://example.com');
var req2 = request('http://example.com');   // happens 10 seconds later
var req3 = request('http://example.com');   // ... and 10 seconds after that!
```
