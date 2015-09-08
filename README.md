# throttled-request

[![npm version](https://img.shields.io/npm/v/throttled-request
.svg)](https://travis-ci.org/JaredReisinger/throttled-request)

[![build status](https://img.shields.io/travis/JaredReisinger/throttled-request/master.svg)](https://travis-ci.org/JaredReisinger/throttled-request)

[![code coverage](https://img.shields.io/codecov/c/JaredReisinger/throttled-request.svg)](https://travis-ci.org/JaredReisinger/throttled-request)

A rate-limited wrapper around request.

----

Interrupts [request](https://www.npmjs.com/package/request)s normal flow of operations by limiting the rate at which new requests can be made.  Unlike other function-throttling modules, this does not drop requests on the floor... all requests will eventually be made.

This was written to assist in limiting web-crawling behavior; it's assumed that slowing down the requests will also slow down the discovery of new URLs.  It was _not_ designed to simply be given hundreds of URLs an ensure that the process doesn't exit until everything's been fetched; you're responsible for your own process management in that case.
