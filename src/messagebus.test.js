import test from 'ava';
import MessageBus from './messagebus';

let messageBus = null;
let httpClientStub = null;
let eventSourceClientStub = null;
const MESSAGE_BUS_HOST = 'http://test.com';

test.beforeEach(() => {
  httpClientStub = {
    post(request, callback) {
      this.lastRequest = request;
      this.onNextRequest(request);
      setTimeout(() => {
        callback(this.error);
        this.error = null;
      });
    },
    onNextRequest() {},
    fail(error) {
      this.error = error;
    }
  };

  eventSourceClientStub = {};

  const eventSourceClientConstructorStub = function stub(host) {
    eventSourceClientStub.host = host;
    return eventSourceClientStub;
  };

  messageBus = new MessageBus(MESSAGE_BUS_HOST, httpClientStub, eventSourceClientConstructorStub);
  messageBus.connect();
});

test('connect to stream', (t) => {
  t.is(eventSourceClientStub.host, `${MESSAGE_BUS_HOST}/sub`);
});

test('publish message', async (t) => {
  const message = {
    name: 'test',
    data: { something: 'here' }
  };

  httpClientStub.onNextRequest = (request) => {
    t.deepEqual(request, {
      url: `${MESSAGE_BUS_HOST}/pub`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      form: JSON.stringify(message)
    });
  };

  await messageBus.publish(message);
});

test('return error when publish fails', async (t) => {
  t.plan(1);

  const expectedError = new Error('something');
  const message = {};

  httpClientStub.fail(expectedError);

  await messageBus.publish(message)
    .catch((error) => {
      t.deepEqual(expectedError, error);
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

test('notify connection errors', (t) => {
  const expectedError = new Error('connection error');

  messageBus.onError((error) => {
    t.deepEqual(error, expectedError);
  });

  eventSourceClientStub.onerror(expectedError);
});

test('notify connection open', (t) => {
  messageBus.onConnect(() => {
    t.pass();
  });

  eventSourceClientStub.onopen();
});
