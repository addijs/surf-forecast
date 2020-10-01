import { StormGlass } from '@src/clients/StormGlass';
import { Beach, GeoPosition } from '@src/models/beach';

import stormGlassNormalizedResponseFixture from '@tests/fixtures/stormglass_normalized_response_3_hours.json';
import { Forecast, ForecastProcessingInternalError } from '../forecast';

jest.mock('@src/clients/StormGlass');

describe('Forecast service', () => {
  const mockedStormGlassClient = new StormGlass() as jest.Mocked<StormGlass>;

  it('should return the forecast for a list of beaches', async () => {
    mockedStormGlassClient.fetchPoints.mockResolvedValue(
      stormGlassNormalizedResponseFixture
    );

    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Mainly',
        position: GeoPosition.E,
        user: 'some-id',
      },
    ];

    const expectedResponse = [
      {
        time: '2020-09-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Mainly',
            position: 'E',
            rating: 1,
            swellDirection: 79.16,
            swellHeight: 0.99,
            swellPeriod: 5.75,
            time: '2020-09-26T00:00:00+00:00',
            waveDirection: 100.54,
            waveHeight: 1.12,
            windDirection: 94.07,
            windSpeed: 5.98,
          },
        ],
      },
      {
        time: '2020-09-26T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Mainly',
            position: 'E',
            rating: 2,
            swellDirection: 95.26,
            swellHeight: 1.16,
            swellPeriod: 5.83,
            time: '2020-09-26T01:00:00+00:00',
            waveDirection: 104.89,
            waveHeight: 1.17,
            windDirection: 102.06,
            windSpeed: 6.23,
          },
        ],
      },
      {
        time: '2020-09-26T02:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Mainly',
            position: 'E',
            rating: 2,
            swellDirection: 111.35,
            swellHeight: 1.33,
            swellPeriod: 5.91,
            time: '2020-09-26T02:00:00+00:00',
            waveDirection: 109.25,
            waveHeight: 1.22,
            windDirection: 110.05,
            windSpeed: 6.48,
          },
        ],
      },
    ];

    const forecast = new Forecast(mockedStormGlassClient);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);

    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('should return an empty list when the beaches array is empty', async () => {
    const forecast = new Forecast();
    const response = await forecast.processForecastForBeaches([]);

    expect(response).toEqual([]);
  });

  it('should throw internal processing error when something goes wrong during the rating process', async () => {
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Mainly',
        position: GeoPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormGlassClient.fetchPoints.mockRejectedValue('Error fetching data');

    const forecast = new Forecast(mockedStormGlassClient);

    await expect(forecast.processForecastForBeaches(beaches)).rejects.toThrow(
      ForecastProcessingInternalError
    );
  });

  it('should return the forecast for mutiple beaches in the same hour with different ratings orderered by rating', async () => {
    mockedStormGlassClient.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 123.41,
        swellHeight: 0.21,
        swellPeriod: 3.67,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 232.12,
        waveHeight: 0.46,
        windDirection: 310.48,
        windSpeed: 100,
      },
    ]);
    mockedStormGlassClient.fetchPoints.mockResolvedValueOnce([
      {
        swellDirection: 64.26,
        swellHeight: 0.15,
        swellPeriod: 13.89,
        time: '2020-04-26T00:00:00+00:00',
        waveDirection: 231.38,
        waveHeight: 2.07,
        windDirection: 299.45,
        windSpeed: 100,
      },
    ]);
    const beaches: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.E,
        user: 'fake-id',
      },
      {
        lat: -33.792726,
        lng: 141.289824,
        name: 'Dee Why',
        position: GeoPosition.S,
        user: 'fake-id',
      },
    ];
    const expectedResponse = [
      {
        time: '2020-04-26T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 141.289824,
            name: 'Dee Why',
            position: 'S',
            rating: 3,
            swellDirection: 64.26,
            swellHeight: 0.15,
            swellPeriod: 13.89,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 231.38,
            waveHeight: 2.07,
            windDirection: 299.45,
            windSpeed: 100,
          },
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 2,
            swellDirection: 123.41,
            swellHeight: 0.21,
            swellPeriod: 3.67,
            time: '2020-04-26T00:00:00+00:00',
            waveDirection: 232.12,
            waveHeight: 0.46,
            windDirection: 310.48,
            windSpeed: 100,
          },
        ],
      },
    ];
    const forecast = new Forecast(mockedStormGlassClient);
    const beachesWithRating = await forecast.processForecastForBeaches(beaches);
    expect(beachesWithRating).toEqual(expectedResponse);
  });
});
