const request = require('request');
const eventsource = require('eventsource');

function MessageBus(
  host,
  httpClient = request,
  EventSource = eventsource
) {
  const listeners = {};
  const errorListeners = [];
  const connectionListeners = [];

  function onMessageReceived(message) {
    const data = JSON.parse(message.data);
    if (listeners[data.name]) {
      listeners[data.name](data);
    }
  }

  function onConnectionError(error) {
    errorListeners.forEach((listener) => {
      listener(error);
    });
  }

  function onConnectionOpen() {
    connectionListeners.forEach((listener) => {
      listener();
    });
  }

  function connect() {
    const eventSource = new EventSource(`${host}/sub`);
    eventSource.onmessage = onMessageReceived;
    eventSource.onerror = onConnectionError;
    eventSource.onopen = onConnectionOpen;
  }

  function publish(message) {
    return new Promise((resolve, reject) => {
      httpClient.post({
        url: `${host}/pub`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        form: JSON.stringify(message)
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  function subscribe(messageType, callback) {
    listeners[messageType] = callback;
  }

  function onError(callback) {
    errorListeners.push(callback);
  }

  function onConnect(callback) {
    connectionListeners.push(callback);
  }

  return {
    publish,
    subscribe,
    connect,
    onError,
    onConnect
  };
}

module.exports = MessageBus;

