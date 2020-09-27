/* eslint-disable @typescript-eslint/no-var-requires */

const { resolve } = require('path');
const root = resolve(__dirname, '..');
const rootConfig = require(`${root}/jest.config.js`);
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...rootConfig,
  ...{
    transform: tsjPreset.transform,
    preset: '@shelf/jest-mongodb',
    rootDir: root,
    displayName: 'end2end-tests',
    setupFilesAfterEnv: ['<rootDir>/__tests__/jest-setup.ts'],
    testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  },
};
