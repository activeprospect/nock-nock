const assert = require('chai').assert;
const nocknock = require('.');

const authenticate = function(opts, cb) {
  cb(null, {outcome: "error", reason: "Invalid token"});
};

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
      assert.equal(returnedData.outcome, 'error');
      assert.equal(returnedData.reason, 'Invalid token');
      done();
    });
  });
});
