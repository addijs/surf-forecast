import config from 'config';
import { AppSetup } from './app';

(async (): Promise<void> => {
  const app = new AppSetup(config.get('App.port'));
  await app.init();

  app.startApp();
})();
