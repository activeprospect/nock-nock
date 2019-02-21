const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const nock = require('nock');

module.exports = function (name, options) {

  // options tell us where to store our fixtures
  options = options || {};
  const fixturesDir = path.join(`${options.testFolder || 'test'}`, `${options.fixturesFolder || 'fixtures'}`);

  if(!fs.existsSync(fixturesDir)) {
    mkdirp.sync(fixturesDir);
  }

  const fixturePath = path.join(fixturesDir, `${name}.js`);

  // `hasFixtures` indicates whether the test has fixtures we should read,
  // or doesn't, so we should record and save them.
  let hasFixtures = process.env.NOCK_RECORD ? process.env.NOCK_RECORD.toLowerCase() === "true" : false;

  return {
    // starts recording, or ensure the fixtures exist
    before: function () {
      if (!hasFixtures) try {
        require(path.join(process.cwd(), fixturePath));
        hasFixtures = true;
      } catch (e) {
        nock.recorder.rec({
          dont_print: true
        });
      } else {
        hasFixtures = false;
        nock.recorder.rec({
          dont_print: true
        });
      }
    },
    // saves our recording if fixtures didn't already exist
    after: function (done) {
      if (!hasFixtures) {
        const fixtures = nock.recorder.play();
        const text = "var nock = require('nock');\n" + fixtures.join('\n');
        fs.writeFile(fixturePath, text, done);
      } else {
        done();
      }
    }
  }
};
