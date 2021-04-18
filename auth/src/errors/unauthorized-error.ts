import { CustomError } from './custom-error';

export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super('unauthorized');

    // when extending a built in class
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [
      { message: 'Unauthorized' }
    ];
  }
}
