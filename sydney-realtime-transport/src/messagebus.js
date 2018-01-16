const request = require('request');
const eventsource = require('eventsource');

function MessageBus(
  host,
  httpClient = request,
  EventSource = eventsource
) {
  const eventSource = new EventSource(`${host}/sub`);
  const listeners = {};

  eventSource.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (listeners[data.name]) {
      listeners[data.name](data);
    }
  };

  function publish(message) {
    httpClient.post({
      url: `${host}/pub`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      form: JSON.stringify(message)
    });
  }

  function subscribe(messageType, callback) {
    listeners[messageType] = callback;
  }

  return { publish, subscribe };
}

module.exports = MessageBus;

