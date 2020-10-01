import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import ApiError from '@src/utils/errors/api-error';
import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { BaseController } from './BaseController';

const rateLimiter = rateLimit({
  windowMs: 1.6 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator(req: Request): string {
    return req.ip; // This limiter applies to each IP
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many requests to the /forecast endpoint',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private forecast = new Forecast()) {
    super();
  }

  @Get()
  @Middleware(rateLimiter)
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.decoded;
      const beaches = await Beach.find({ user: user?.id });
      const forecastData = await this.forecast.processForecastForBeaches(
        beaches
      );

      res.status(200).send(forecastData);
    } catch (err) {
      logger.error(err);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
