const pathToRegexp = require('path-to-regexp');

function app() {
  this.routes = {};

  function method(type) {
    if (! this.routes[type]) {
      this.routes[type] = [];
    }

    function push(route, handler) {
      this.routes[type].push([
        pathToRegexp(route),
        handler,
      ]);
    }

    return push.bind(this);
  }

  function match(method, path) {
    if (! this.routes[method]) {
      return null;
    }

    for (const route of this.routes[method]) {
      const hits = route[0].exec(path);

      if (hits) {
        const clean = Object
          .keys(hits)
          .filter(key => ! isNaN(key))
          .map(key => hits[key]);

        return [clean, route[1]];
      }
    }

    return null;
  }

  return {
    get: method('get'),
    post: method('post'),
    put: method('put'),
    delete: method('delete'),
    match: match.bind(this),
  };
}

module.exports = app;
