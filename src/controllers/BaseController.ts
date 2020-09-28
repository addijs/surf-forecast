import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

interface ErrorObject {
  code: number;
  error: string;
}

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(clientErrors);
    } else {
      logger.error(error);
      res.status(500).send({ code: 500, error: 'Internal Server Error' });
    }
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): ErrorObject {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      err => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    } else {
      return { code: 422, error: error.message };
    }
  }
}
