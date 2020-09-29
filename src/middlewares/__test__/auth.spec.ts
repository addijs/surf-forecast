import AuthService from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('Auth middleware tests', () => {
  it('should verify a JWT token and call the next middleware', async () => {
    const jwtToken = AuthService.generateToken({ data: 'fake' });
    const reqFake = {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    };

    const resFake = {};
    const nextFake = jest.fn();

    authMiddleware(reqFake, resFake, nextFake);

    expect(nextFake).toHaveBeenCalled();
  });

  it('should return UNAUTHORIZED if there is a problem on the token verification', async () => {
    const reqFake = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };

    const nextFake = jest.fn();

    // eslint-disable-next-line @typescript-eslint/ban-types
    authMiddleware(reqFake, resFake as object, nextFake);

    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt malformed',
    });
  });

  it('should return UNAUTHORIZED if there is no token', async () => {
    const reqFake = {
      headers: {},
    };

    const sendMock = jest.fn();
    const resFake = {
      status: jest.fn(() => ({
        send: sendMock,
      })),
    };

    const nextFake = jest.fn();

    // eslint-disable-next-line @typescript-eslint/ban-types
    authMiddleware(reqFake, resFake as object, nextFake);

    expect(resFake.status).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith({
      code: 401,
      error: 'jwt must be provided',
    });
  });
});
