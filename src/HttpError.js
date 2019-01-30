class HttpError extends Error {
  constructor(message, codeHint = null) {
    super(message);

    this._httpSafe = true;
    this.codeHint = codeHint;
  }
}

module.exports = HttpError;
