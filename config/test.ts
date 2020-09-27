import MongoDBMemoryServer from '../globalConfig.json';

export default {
  App: {
    database: {
      mongoUrl: MongoDBMemoryServer.mongoUri,
    },
    resources: {
      StormGlass: {
        apiToken: 'test-token',
      },
    },
  },
};
