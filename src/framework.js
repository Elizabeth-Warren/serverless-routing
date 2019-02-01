const pathToRegexp = require('path-to-regexp');

function app(options = {}) {
  const { basePath = '/api' } = options;
  const hasBasePath = basePath && !! basePath.length;

  this.routes = {};

  function computePath(input) {
    const isTrailingSlash = input === '/';

    return hasBasePath ? `${basePath}${isTrailingSlash ? '' : input}` : input;
  }

  function method(type) {
    const formattedType = type.toLowerCase();

    if (! this.routes[formattedType]) {
      this.routes[formattedType] = [];
    }

    function push(route, handler) {
      this.routes[formattedType].push([
        pathToRegexp(computePath(route)),
        handler,
      ]);
    }

    return push.bind(this);
  }

  function match(method, path) {
    const formattedMethod = method.toLowerCase();

    if (! this.routes[formattedMethod]) {
      return null;
    }

    for (const route of this.routes[formattedMethod]) {
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
