const { assert } = require('chai');
const framework = require('../src/framework');
const router = require('../src/router');

describe('test router module', function() {
  it('should return a function to handle routing', function() {
    const app = framework();
    assert.isFunction(router(app));
  });

  it('should return a 404 error for a non-existent route', function(callback) {
    const app = framework();
    const onRequest = router(app);

    onRequest({ httpMethod: 'get', path: '/' }, {}, (err, response) => {
      assert.equal(response.statusCode, 404);
      assert.isString(JSON.parse(response.body).error.message);

      callback();
    });
  });

  it('should parse the json body of a post request with application/json headers', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.post('/', ({ json }) => {
      assert.isTrue(json.works);
    });

    onRequest({
      httpMethod: 'POST',
      path: '/api',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ works: true }),
    }, {}, callback);
  });

  it('should parse the json body of a post request with lowercase application/json headers', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.post('/', ({ json }) => {
      assert.isTrue(json.works);
    });

    onRequest({
      httpMethod: 'post',
      path: '/api',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ works: true }),
    }, {}, callback);
  });

  it('should return an error for malformatted json', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.post('/', ({ json }) => {
      assert.isTrue(json.works);
    });

    onRequest({
      httpMethod: 'post',
      path: '/api',
      headers: { 'Content-Type': 'application/json' },
      body: 'this wont parse',
    }, {}, (err, response) => {
      assert.equal(response.statusCode, 400);
      assert.isString(JSON.parse(response.body).error.message);

      callback();
    });
  });

  it('should not parse the json body of a post request when missing application/json headers', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.post('/', ({ json }) => {
      assert.isNull(json);
    });

    onRequest({
      httpMethod: 'post',
      path: '/api',
      body: JSON.stringify({ works: true }),
    }, {}, callback);
  });

  it('should inject request parameters', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.get('/:one/:two', ({ params }) => {
      assert.equal(params[0], 'foo');
      assert.equal(params[1], 'bar');
    });

    onRequest({
      httpMethod: 'get',
      path: '/api/foo/bar',
    }, {}, callback);
  });

  it('should inject response helper functions', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.get('/', ({ success, failed }) => {
      assert.isFunction(success);
      assert.isFunction(failed);

      assert.equal(success().statusCode, 200);
      assert.equal(success({}, 201).statusCode, 201);
      assert.equal(success({}, null).statusCode, 200);
      assert.equal(success({ test: true }).body, '{"test":true}');
      assert.equal(success({ test: true }, 200, 'json').body, '{"test":true}');
      assert.equal(success('<xml></xml>', 200, 'xml').body, '<xml></xml>');

      assert.equal(success({ test: true }).headers['Content-Type'], 'application/json');
      assert.equal(success('<xml></xml>', 200, 'xml').headers['Content-Type'], 'application/xml');

      assert.equal(failed().statusCode, 500);
      assert.equal(failed(new Error(), 400).statusCode, 400);
      assert.equal(failed(new Error(), null).statusCode, 500);
      assert.notEqual(JSON.parse(failed(new Error('test')).body).error.message, 'test');

      const httpSafeError = new Error('test');
      httpSafeError._httpSafe = true;
      assert.equal(JSON.parse(failed(httpSafeError).body).error.message, 'test');
    });

    onRequest({
      httpMethod: 'get',
      path: '/api',
    }, {}, callback);
  });

  it('should return the route handler response', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.get('/', ({ success }) => {
      return success({ test: true });
    });

    onRequest({ httpMethod: 'get', path: '/api' }, {}, (err, response) => {
      assert.isTrue(JSON.parse(response.body).test);

      callback();
    });
  });

  it('should wait for an async route handler', function(callback) {
    const app = framework();
    const onRequest = router(app);

    function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    app.get('/', async ({ success }) => {
      await timeout(10);
      return success({ test: true });
    });

    onRequest({ httpMethod: 'get', path: '/api' }, {}, (err, response) => {
      assert.isTrue(JSON.parse(response.body).test);

      callback();
    });
  });

  it('should return an error if the route handler returns no response', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.get('/', ({ success }) => {
      success({ test: true });
    });

    onRequest({ httpMethod: 'get', path: '/api' }, {}, (err, response) => {
      assert.equal(response.statusCode, 500);

      callback();
    });
  });

  it('should return an error if the route handler throws an error', function(callback) {
    const app = framework();
    const onRequest = router(app);

    app.get('/', ({ success }) => {
      throw new Error('[FIRE DRILL] This error is intentionally being thrown for testing purposes.')
    });

    onRequest({ httpMethod: 'get', path: '/api' }, {}, (err, response) => {
      assert.equal(response.statusCode, 500);

      callback();
    });
  });
});
