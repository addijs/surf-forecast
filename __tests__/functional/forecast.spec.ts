import stormGlassWeather3HoursFixture from '@tests/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@tests/fixtures/api_forecast_response_1_beach.json';
import { Beach, GeoPosition } from '@src/models/beach';
import nock from 'nock';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Beach foreacast functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@mail.com',
    password: '1234',
  };

  let token: string;
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.E,
      user: user.id,
    };
    await new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.toJSON());
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        params: /(.*)/,
        end: /(.*)/,
        source: 'noaa',
        lat: '-33.792726',
        lng: '151.289824',
      })
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await global.testRequest.get('/forecast').set({
      Authorization: `Bearer ${token}`,
    });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
      })
      .replyWithError('Something went wrong');

    const { status } = await global.testRequest.get('/forecast').set({
      Authorization: `Bearer ${token}`,
    });
    expect(status).toBe(500);
  });
});
