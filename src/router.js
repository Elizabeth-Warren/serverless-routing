const HttpError = require('./HttpError');

function transformBody(body, type) {
  if (type === 'json') {
    return JSON.stringify(body);
  }

  return body;
}

function transformContentType(type) {
  if (type === 'json') {
    return `application/json`;
  }

  if (type === 'xml') {
    return `application/xml`;
  }

  return '';
}

function router(app) {
  async function onRequest(event, context, callback) {
    const {
      path,
      httpMethod: method,
      requestContext: {
        identity: {
          sourceIp,
          userAgent,
        },
      },
    } = event;

    const match = app.match(method, path);
    const requestStart = Date.now();

    function log(statusCode) {
      console.log(`method=${method} path=${path} status=${statusCode} duration=${Date.now() - requestStart}ms ip=${sourceIp} agent=${userAgent}`);
    }

    const success = (body = {}, statusCode = 200, type = 'json') => {
      log(statusCode);

      return ({
        statusCode: statusCode || 200,
        body: transformBody(body, type),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': transformContentType(type),
        },
      });
    };

    const failed = (error = new HttpError('Server encountered an error.'), statusCode = 500) => {
      log(statusCode);

      return ({
        statusCode: statusCode || 500,
        body: JSON.stringify({ error: { message: `${error._httpSafe ? error.message : 'Server encountered an error.'}` } }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
      });
    };

    if (! match) {
      const error = new Error('This resource does not exist.');
      error._httpSafe = true;

      return callback(null, failed(error, 404));
    }

    const [hits, routeHandler] = match;

    const { body = null, headers = {} } = event;
    let json = null;

    const lowercaseHeaders = Object.keys(headers)
      .reduce((acc, key) => ({
        ...acc,
        [key.toLowerCase()]: headers[key].toLowerCase(),
      }), {});

    const hasJsonContentType = lowercaseHeaders['content-type'] === 'application/json';

    if (hasJsonContentType && body && ['post', 'put'].includes(method.toLowerCase())) {
      try {
        json = JSON.parse(body);
      } catch(error) {
        return callback(null, failed('Malformed json body.', 400));
      }
    }

    try {
      const [path, ...params] = hits;

      const response = await routeHandler({
        event, context, callback,
        success, failed,
        path, params, json,
      });

      if (! response) {
        return callback(null, failed());
      }

      return callback(null, response);
    } catch (error) {
      console.error(error);
      return callback(null, failed(error));
    }
  }

  return onRequest;
}

module.exports = router;
