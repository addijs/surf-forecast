import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';
import { BaseController } from './BaseController';

const forecast = new Forecast();

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get()
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.decoded;
      const beaches = await Beach.find({ user: user?.id });
      const forecastData = await forecast.processForecastForBeaches(beaches);

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
