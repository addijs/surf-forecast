import { ForecastPoint, StormGlass } from '@src/clients/StormGlass';
import { Beach } from '@src/models/beach';
import { InternalError } from '@src/utils/errors/internal-error';
import { Rating } from './rating';
import logger from '@src/logger';
import _ from 'lodash';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);

      const allTimeForecasts = this.mapForecastByTime(beachForecast);

      return allTimeForecasts.map(timeForecast => ({
        time: timeForecast.time,
        forecast: _.orderBy(timeForecast.forecast, ['rating'], ['desc']),
      }));
    } catch (err) {
      logger.error(err);
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    logger.info(`Preparing the forecast for ${beaches.length}`);
    const pointsWithCorrectSources: BeachForecast[] = [];

    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const enrichedBeachData = this.enrichedBeachData(points, beach, rating);

      pointsWithCorrectSources.push(...enrichedBeachData);
    }

    return pointsWithCorrectSources;
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): BeachForecast[] {
    return points.map(point => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRatingForPoint(point),
      },
      ...point,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];

    for (const point of forecast) {
      const timePoint = forecastByTime.find(
        forecast => forecast.time === point.time
      );

      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }

    return forecastByTime;
  }
}
