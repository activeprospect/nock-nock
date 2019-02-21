# nock nock 

A simple record and replay `nock` helper.

## Example Usage

```js
const assert = require('chai').assert;
const nocknock = require('.');

describe('Some test area', () => {

  let recorder = null;
  afterEach((done) => {
    if(recorder) {
      recorder.after(done);
    }
    else {
      done();
    }
  });

  it('should handle login failure', (done) => {
    recorder = nocknock('failed_login');
    recorder.before();

    authenticate({token: 'abc123'}, (err, returnedData) => {
      assert.equal(returnedData.type, 'error');
      assert.equal(returnedData.message, 'Invalid token');
      done();
    });
  });
});
```

When the above code is run and there's not yet a `failed_login.js` fixture saved in (by default) `test/fixtures`, then nock will be used to record the results of a live call to whatever service the `login()` function under test calls.

The resulting fixture file in `test/fixtures/failed_login.js` might look like this:

```js
var nock = require('nock');

nock('https://example.com:443', {"encodedQueryParams":true})
  .post('/rest/api/v13/auth', "token=abc123")
  .reply(400, {"type":"error","message":"Invalid token","errorCode":"82"}, [ 'Max-Forwards',
  '20',
  'Via',
  '1.0 oag02-example.com ()',
  'Connection',
  'close',
  'X-CorrelationID',
  'Id-ff565c5c9a9ba52b627183f4 0',
  'Date',
  'Thu, 07 Feb 2019 16:04:15 GMT',
  'Server',
  'Apache',
  'X-Frame-Options',
  'SAMEORIGIN',
  'Content-Type',
  'application/json;charset=UTF-8' ]);
```

Once the fixture file exists, the next run of that test will use that nock data, with no actual call being made to the external service. 

Those fixture files can then be easily modified, or duplicated to mock different endpoint behaviors. Multiple `nock()` calls can be included in a single fixture (e.g., if another test in this example used a successful authentication, followed by another API call).

To re-record an existing fixture, either delete the fixture file(s), or set the environment variable `NOCK_RECORD` to "true".
