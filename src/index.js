const config = require('./config').load();
const MessageBus = require('./messagebus');
const app = require('./app');
const Updater = require('./updater');
const RealtimeApiClient = require('./realtime-api-client');

const messageBus = new MessageBus(config.messageBusHost);

const client = RealtimeApiClient({
  busesUrl: config.realtimeApi.url,
  apiKey: config.realtimeApi.apiKey
});

const updater = Updater(client.fetchBusesPositions, {
  interval: config.realtimeApi.updateInterval
});

updater.onError((error) => {
  console.log('updater error');
  console.log(error);
});

messageBus.onError((error) => {
  console.log('error');
  console.log(error);
});

messageBus.onConnect(() => {
  console.log('Connected');
});

messageBus.connect();

app(messageBus, updater);
