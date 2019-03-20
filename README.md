# serverless-routing

Provides a simple routing interface for AWS Lambda functions using the Serverless Framework.

## Getting Started

To get started with serverless-routing, install the package from NPM.

```sh
$ npm install @ewarren/serverless-routing
```

Next, add the following configuration to your project `serverless.yaml` and replace `hello` with the name of your function.

```xml
functions:
  hello:
    handler: src/handler.router
    events:
      - http:
          path: /api
          method: any
          cors: true
      - http:
          path: /api/{proxy+}
          method: any
          cors: true
```

Lastly, setup your endpoints.

```js
/* src/handler.js */

const { framework, router } = require('@ewarren/serverless-routing');
const app = framework();

require('./routes/users')(app);
require('./routes/signups')(app);

module.exports.router = router(app);

/* src/routes/users.js */

module.exports = (app) => {
  app.get('/user/:id', ({ success }) => {
    return success({ ok: true });
  });

  app.put('/user/:id', ({ success }) => {
    return success({ ok: true });
  });
};
```

## API Reference

**framework(options)**

When constructing a new application you can pass in options to override the default router configuration.

`options.basePath`: The path prefix which prepends all API routes in this service (_not the API Gateway stage name_). Defaults to `/api`.

**app.{get|put|post|delete}('/*', callback)**

Create an endpoint for the given endpoint and path. Paths can include custom parameters, eg: `app.get('/user/:id', ...)`.

**onRequestCallback**

The route handler should accept a single object argument that can be deconstructed to obtain the following properties. The route handler most return its response data.

Route handlers can be asynchronous functions, and their execution is encapsulated in an error handler within the router in the event of failure.

`event`: The original AWS API Gateway event data about the request. [Read more](https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request).

`context`: The original AWS Lambda context object. [Read more](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html).

`callback`: The original AWS Lambda callback function.

`success(data: Object, statusCode: Number = 200, type: String = 'json')`: A helper function to generate a successful http response. Defaults to an empty json object with status code 200.

`failed(error: Error, code: Number)`: A helper function to generate a JSON response representing an error. Any error that is an instance of `HttpError` will have their message dropped into the error response. Otherwise all error messages are replaced with a safe default. The default status code is 500.

`path`: The full path of the endpoint that was requested.

`params`: An array of strings that represent any path parameters which were matched in the route. For example, if the route was `/test/:one/:two`, and the following path was requested, `/test/foo/bar`, the `params` array would contain `['foo', 'bar']`.

`json`: If the request method is `PUT` or `POST` and contains a JSON content type header, the router will attempt to safely parse the request body. Defaults to `null` otherwise.

**HttpError**

Use this to deliver an error message to the response without leaking anything sensitive.

```js
const { HttpError } = require('@ewarren/serverless-routing');

module.exports = (app) => {
  app.get('/user/:id', ({ success }) => {
    throw new HttpError('This message will be in the API response.');
  });
};
```

In addition to a `message` you can also pass in a numeric `codeHint` to the constructor to inform your route handler response code.

## Local Development

To run tests locally, ensure you have [Docker](https://docker.com) installed.

```sh
$ make tests
```

## Publishing new versions

(Coming soon) This repo is outfitted with Github Actions that automatically publish the package if tests pass and the version number has been bumped.
