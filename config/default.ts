export default {
  App: {
    database: {
      mongoUrl:
        'mongodb+srv://surf-forecast-user:SurF-f0r3c4st-p4SSw0rd@aj-cluster.ttlq6.mongodb.net/surf-forecast-db?retryWrites=true&w=majority',
    },
    resources: {
      StormGlass: {
        apiUrl: 'https://api.stormglass.io/v2',
        apiToken: 'api-token',
      },
    },
  },
};
