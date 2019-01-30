class HttpError extends Error {
  constructor(message) {
    super(message);

    this._httpSafe = true;
  }
}

module.exports = HttpError;
