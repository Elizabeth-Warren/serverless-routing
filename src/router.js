const HttpError = require('./HttpError');

function router(app) {
  async function onRequest(event, context, callback) {
    const success = (body = {}, statusCode = 200) => ({
      statusCode: statusCode || 200,
      body: JSON.stringify(body),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    });

    const failed = (error = new HttpError('Server encountered an error.'), statusCode = 500) => ({
      statusCode: statusCode || 500,
      body: JSON.stringify({ error: { message: `${error._httpSafe ? error.message : 'Server encountered an error.'}` } }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    });

    const { path, httpMethod: method } = event;
    const match = app.match(method, path);

    if (! match) {
      const error = new Error('This resource does not exist.');
      error._httpSafe = true;

      return callback(null, failed(error, 404));
    }

    const [hits, routeHandler] = match;

    const { body = null, headers = {} } = event;
    let json = null;

    const hasJsonContentType = headers['Content-Type'] === 'application/json';

    if (hasJsonContentType && body && ['post', 'put'].includes(method)) {
      try {
        json = JSON.parse(body);
      } catch(error) {
        return callback(null, failed('Malformed json body.', 400));
      }
    }

    try {
      const [path, ...params] = hits;

      const response = await routeHandler({
        event, context,
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
