/** Error carrying an HTTP status and optional per-field messages for form display. */
export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
