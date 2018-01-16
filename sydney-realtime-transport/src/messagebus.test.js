import test from 'ava';
import MessageBus from './messagebus';

let messageBus = null;
let httpClientStub = null;
let eventSourceClientStub = null;
const MESSAGE_BUS_HOST = 'http://test.com';

test.beforeEach(() => {
  httpClientStub = {
    post(request) {
      this.lastRequest = request;
    }
  };

  eventSourceClientStub = {};

  const eventSourceClientConstructorStub = function stub(host) {
    eventSourceClientStub.host = host;
    return eventSourceClientStub;
  };

  messageBus = new MessageBus(MESSAGE_BUS_HOST, httpClientStub, eventSourceClientConstructorStub);
});

test('listen to stream', (t) => {
  t.is(eventSourceClientStub.host, `${MESSAGE_BUS_HOST}/sub`);
});

test('publish message', (t) => {
  const message = {
    name: 'test',
    data: { something: 'here' }
  };

  messageBus.publish(message);

  t.deepEqual(httpClientStub.lastRequest, {
    url: `${MESSAGE_BUS_HOST}/pub`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    form: JSON.stringify(message)
  });
});

test('subscribe to message', (t) => {
  t.plan(1);

  const expectedMessage = { name: 'test-message', data: 'something' };
  const notExpectedMessage = { name: 'another-message', data: 'something else' };

  messageBus.subscribe('test-message', (message) => {
    t.deepEqual(message, expectedMessage);
  });

  eventSourceClientStub.onmessage({ data: JSON.stringify(expectedMessage) });
  eventSourceClientStub.onmessage({ data: JSON.stringify(notExpectedMessage) });
});

test('subscribe to multiple messages', (t) => {
  t.plan(2);

  const expectedMessage = { name: 'test-message', data: 'something' };
  const expectedMessage2 = { name: 'another-message', data: 'something else' };

  messageBus.subscribe('test-message', (message) => {
    t.deepEqual(message, expectedMessage);
  });

  messageBus.subscribe('another-message', (message) => {
    t.deepEqual(message, expectedMessage2);
  });

  eventSourceClientStub.onmessage({ data: JSON.stringify(expectedMessage) });
  eventSourceClientStub.onmessage({ data: JSON.stringify(expectedMessage2) });
});
