import test from 'ava';
import App from './app';

import messageBusFake from './test-helpers/message-bus-fake';
import updaterFake from './test-helpers/updater-fake';
import dateFake from './test-helpers/date-fake';

let timeoutCallback = null;
let timeoutScheduleCount = 0;
const setTimeoutFake = (callback) => {
  timeoutScheduleCount += 1;
  timeoutCallback = callback;
};

test.beforeEach(() => {
  messageBusFake.reset();
  updaterFake.reset();
  dateFake.reset();

  timeoutCallback = null;
  timeoutScheduleCount = 0;
});


test('start update when updates for Sydney requested', (t) => {
  t.plan(1);

  updaterFake.onStart = () => {
    t.pass();
  };

  updaterFake.onStop = () => {
    t.fail('should not stop updater');
  };

  App(messageBusFake, updaterFake, dateFake, setTimeoutFake);

  const message = { name: 'TRANSPORT_LIVE_POSITION_REQUESTED', data: { city: 'AU_SYDNEY' } };
  messageBusFake.listeners.TRANSPORT_LIVE_POSITION_REQUESTED(message);
});

test('DO NOT start update when updates for another city requested', (t) => {
  t.plan(0);

  updaterFake.onStart = () => {
    t.fail('should not start updater');
  };

  updaterFake.onStop = () => {
    t.fail('should not stop updater');
  };

  App(messageBusFake, updaterFake, dateFake, setTimeoutFake);

  const message = { name: 'TRANSPORT_LIVE_POSITION_REQUESTED', data: { city: 'AU_MELBOURNE' } };
  messageBusFake.listeners.TRANSPORT_LIVE_POSITION_REQUESTED(message);
});

test('stop updates after 10 minutes without receiving messages', (t) => {
  t.plan(1);

  const FIVE_MINUTES_IN_MS = 300000;

  updaterFake.onStop = () => {
    t.pass();
  };

  App(messageBusFake, updaterFake, dateFake, setTimeoutFake);
  const message = { name: 'TRANSPORT_LIVE_POSITION_REQUESTED', data: { city: 'AU_SYDNEY' } };
  messageBusFake.listeners.TRANSPORT_LIVE_POSITION_REQUESTED(message);

  timeoutCallback();
  dateFake.date += FIVE_MINUTES_IN_MS + 1;
  timeoutCallback();
});

test('message heartbeat check is scheduled again after check', (t) => {
  App(messageBusFake, updaterFake, dateFake, setTimeoutFake);
  t.is(timeoutScheduleCount, 1);
  timeoutCallback();
  t.is(timeoutScheduleCount, 2);
});

test('publish message when data updated', (t) => {
  App(messageBusFake, updaterFake, dateFake, setTimeoutFake);
  const message = { name: 'TRANSPORT_LIVE_POSITION_REQUESTED', data: { city: 'AU_SYDNEY' } };
  messageBusFake.listeners.TRANSPORT_LIVE_POSITION_REQUESTED(message);

  const updateData = { some: 'data' };

  updaterFake.onUpdateCallback(updateData);

  t.deepEqual(messageBusFake.lastPublishedMessage, {
    name: 'TRANSPORT_LIVE_POSITION_UPDATED',
    data: updateData,
    version: 1
  });
});
