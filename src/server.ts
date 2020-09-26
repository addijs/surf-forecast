import { Server } from '@overnightjs/core';
import './utils/module-alias';
import express from 'express';
import init from 'module-alias';

export class ServerSetup extends Server {
  constructor(private port = 3333) {
    super();

    init();
  }

  public init(): void {
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
  }

  private initializeControllers() {}
}
