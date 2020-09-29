import './utils/module-alias';
import { Server } from '@overnightjs/core';
import { BeachController } from './controllers/BeachController';
import express, { Application } from 'express';
import { ForecastController } from './controllers/ForecastController';
import * as db from '@src/database';
import { UserController } from './controllers/UserController';
import logger from './logger';
import expressPino from 'express-pino-logger';
import cors from 'cors';

export class AppSetup extends Server {
  constructor(private port = 3333) {
    super();
  }

  public getApp(): Application {
    return this.app;
  }

  public async init(): Promise<void> {
    this.initializeMiddlewares();
    this.initializeControllers();
    await this.databaseSetup();
  }

  public startApp(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port ${this.port}`);
    });
  }

  public async closeApp(): Promise<void> {
    await db.close();
  }

  private async databaseSetup(): Promise<void> {
    await db.connect();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(cors());
  }

  private initializeControllers(): void {
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    const userController = new UserController();

    this.addControllers([forecastController, beachController, userController]);
  }
}
