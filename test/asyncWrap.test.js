const { assert } = require('chai');
const asyncWrap = require('../src/asyncWrap');
const HttpError = require('../src/HttpError');

describe('Async Wrap should properly catch all errors in async functions', function() {
  it('should return a wrapped function', function() {
    assert.isFunction(asyncWrap(() => {}));
  });

  it('should pass all arguments to the wrapped function', function(callback) {
    asyncWrap((a, b) => {
      assert.equal(a, 1);
      assert.equal(b, 2);
      callback();
    })(1, 2);
  });

  it('should catch any error thrown in the async function', async function() {
    const result = await asyncWrap(async () => {
      throw new Error('FALSE ALARM - TESTING ONLY');
    })();

    assert.isTrue(result._httpSafe);
    return true;
  });

  it('should pass the thrown HttpError', async function() {
    const result = await asyncWrap(async () => {
      throw new HttpError('FALSE ALARM - HTTP ERROR TESTING ONLY');
    })();

    assert.equal(result.message, 'FALSE ALARM - HTTP ERROR TESTING ONLY');
    return true;
  });
});
