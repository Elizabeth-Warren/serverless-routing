const { assert } = require('chai');
const HttpError = require('../src/HttpError');

describe('HttpError should have correct properties', function() {
  it('should have the http safe flag', function() {
    assert.isTrue(new HttpError()._httpSafe);
  });

  it('should accept a custom message', function() {
    assert.equal(new HttpError('test').message, 'test');
  });

  it('should accept a custom status code', function() {
    assert.equal(new HttpError('test', 201).codeHint, 201);
  });

  it('should be throwable', function() {
    assert.throws(() => {
      throw new HttpError();
    }, HttpError);
  });
});
