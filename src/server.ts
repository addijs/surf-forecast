import config from 'config';
import { AppSetup } from './app';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

// Handling with unhandle promises

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason ${reason}`
  );
  throw reason;
});

// Handling with uncaught exceptions

process.on('uncaughtException', error => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const app = new AppSetup(config.get('App.port'));
    await app.init();

    app.startApp();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.forEach(sig =>
      process.on(sig, async () => {
        try {
          await app.closeApp();
          logger.info('App exited with success');
          process.exit(ExitStatus.Success);
        } catch (err) {
          logger.error(`App exited with error: ${err}`);
          process.exit(ExitStatus.Failure);
        }
      })
    );
  } catch (err) {
    logger.error(`App exited with error: ${err}`);
    process.exit(ExitStatus.Failure);
  }
})();
