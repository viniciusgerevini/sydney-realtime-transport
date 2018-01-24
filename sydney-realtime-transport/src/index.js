const config = require('./config').load();
const MessageBus = require('./messagebus');
const app = require('./app');

const messageBus = new MessageBus(config.messageBusHost);
const updater = {
  start() {
  },
  stop() {
  },
  onUpdate(callback) {
    setTimeout(() => {
      callback({ fake: 'data' });
    }, 20000);
  }
};

messageBus.onError((error) => {
  console.log('error');
  console.log(error);
});

messageBus.onConnect(() => {
  console.log('Connected');
});

messageBus.connect();

app(messageBus, updater);
