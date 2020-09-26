import './utils/module-alias';
import { Server } from '@overnightjs/core';
import express, { Application } from 'express';
import { ForecastController } from './controllers/ForecastController';

export class ServerSetup extends Server {
  constructor(private port = 3333) {
    super();
  }

  public getApp(): Application {
    return this.app;
  }

  public async init(): Promise<void> {
    this.initializeMiddlewares();
    this.initializeControllers();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
  }

  private initializeControllers(): void {
    const forecastController = new ForecastController();

    this.addControllers([forecastController]);
  }
}
