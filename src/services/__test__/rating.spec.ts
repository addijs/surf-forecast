import { GeoPosition } from '@src/models/beach';
import { Rating } from '../rating';

describe('Rating service', () => {
  const defaultBeach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Mainly',
    position: GeoPosition.E,
    user: 'some-user',
  };

  const defaultRating = new Rating(defaultBeach);

  describe('Get rating based on wind and wave position', () => {
    it('should get rating 1 for a beach onshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.E
      );

      expect(rating).toBe(1);
    });

    it('should get rating 3 for a beach with cross winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.S
      );

      expect(rating).toBe(3);
    });

    it('should get rating 5 for a beach with offshore winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWavePositions(
        GeoPosition.E,
        GeoPosition.W
      );

      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell period', () => {
    it('should get rating 1 for a period of 5 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(5);
      expect(rating).toBe(1);
    });

    it('should get rating 2 for a period of 9 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(9);
      expect(rating).toBe(2);
    });

    it('should get rating 4 for a period of 12 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(12);
      expect(rating).toBe(4);
    });

    it('should get rating 5 for a period of 16 seconds', () => {
      const rating = defaultRating.getRatingForSwellPeriod(16);
      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell height', () => {
    it('should get rating 1 for less than ankle to knee high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.2);
      expect(rating).toBe(1);
    });

    it('should get rating 2 for ankle to knee swell', () => {
      const rating = defaultRating.getRatingForSwellSize(0.6);
      expect(rating).toBe(2);
    });

    it('should get rating 3 for waist high swell', () => {
      const rating = defaultRating.getRatingForSwellSize(1.5);
      expect(rating).toBe(3);
    });

    it('should get rating 5 for overhead swell', () => {
      const rating = defaultRating.getRatingForSwellSize(2.5);
      expect(rating).toBe(5);
    });
  });

  describe('Get position based on point location', () => {
    it('should get the point based on a east position', () => {
      const rating = defaultRating.getPositionFromLocation(92);
      expect(rating).toBe(GeoPosition.E);
    });

    it('should get the point based on a north position 1', () => {
      const rating = defaultRating.getPositionFromLocation(360);
      expect(rating).toBe(GeoPosition.N);
    });

    it('should get the point based on a north position 2', () => {
      const rating = defaultRating.getPositionFromLocation(40);
      expect(rating).toBe(GeoPosition.N);
    });

    it('should get the point based on a south position', () => {
      const rating = defaultRating.getPositionFromLocation(200);
      expect(rating).toBe(GeoPosition.S);
    });

    it('should get the point based on a west position', () => {
      const rating = defaultRating.getPositionFromLocation(300);
      expect(rating).toBe(GeoPosition.W);
    });
  });

  describe('Calculate rating for a given point', () => {
    const defaultPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'fake-time',
      waveDirection: 110,
      windDirection: 100,
      waveHeight: 0.1,
      windSpeed: 100,
    };

    it('should get a rating less than 1 for a poor point', () => {
      const rating = defaultRating.getRatingForPoint(defaultPoint);
      expect(rating).toBe(1);
    });

    it('should get a rating 1 for an OK point', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.4,
        },
      };

      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(1);
    });

    it('should get a rating 3 for a point with offshore winds and a half of overhead height', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          windDirection: 250,
        },
      };

      const rating = defaultRating.getRatingForPoint(point);

      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 1.5,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 a good condition but with crossshore winds', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 130,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(5);
    });
  });
});
