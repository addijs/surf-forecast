import { ServerSetup } from '@src/server';
import supertest from 'supertest';

const setup = new ServerSetup();

beforeAll(async () => {
  await setup.init();

  global.testRequest = supertest(setup.getApp());
});
