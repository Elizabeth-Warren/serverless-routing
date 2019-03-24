const HttpError = require('./HttpError');

/**
 * Wrap an 'async' function in a try/catch block
 * to make sure errors are captured.
 *
 * @param  {Function} fn Async function
 * @return {Function}
 */
function asyncWrap(fn) {
  async function wrapper(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(error);

      if (error._httpSafe) {
        return error;
      }

      return new HttpError('Encountered a server error.', 500);
    }
  }

  return wrapper;
}

module.exports = asyncWrap;
