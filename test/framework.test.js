const { assert } = require('chai');
const framework = require('../src/framework');

describe('test framework module', function() {
  it('should export a function that returns an application container', function() {
    assert.isObject(framework());
    assert.isFunction(framework().get);
    assert.isFunction(framework().post);
    assert.isFunction(framework().put);
    assert.isFunction(framework().delete);
    assert.isFunction(framework().match);
  });

  it('should accept routes and match them later based on method', function() {
    const app = framework();

    app.get('/', 'get /');
    app.get('/test', 'get /test');

    app.post('/', 'post /');
    app.post('/test', 'post /test');

    assert.deepEqual(app.match('get', '/'), [['/'], 'get /']);
    assert.deepEqual(app.match('get', '/test'), [['/test'], 'get /test']);
    assert.deepEqual(app.match('post', '/'), [['/'], 'post /']);
    assert.deepEqual(app.match('post', '/test'), [['/test'], 'post /test']);

    assert.isNull(app.match('get', '/fake'));
    assert.isNull(app.match('fake', '/'));
  });

  it('should match parameters in the route', function() {
    const app = framework();

    app.get('/foo/:bar/:baz', () => {});
    const [[path, bar, baz], handler] = app.match('get', '/foo/1/2');

    assert.equal(path, '/foo/1/2');
    assert.equal(bar, '1');
    assert.equal(baz, '2');
  });
});
