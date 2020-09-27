import { AppSetup } from '@src/app';
import supertest from 'supertest';

let setup: AppSetup;

beforeAll(async () => {
  setup = new AppSetup();
  await setup.init();

  global.testRequest = supertest(setup.getApp());
});

afterAll(async () => {
  await setup.closeApp();
});
