import test from 'ava';
import Updater from './updater';

test('execute action on start', (t) => {
  const options = {};
  const fakeInterval = () => { };

  let runs = 0;
  const fakeAction = () => {
    runs += 1;
  };

  const updater = Updater(fakeAction, options, fakeInterval);

  t.is(runs, 0);
  updater.start();
});

test('execute action after given interval', (t) => {
  let runs = 0;
  const options = {
    interval: 1000
  };

  let action = null;
  let interval = null;
  const fakeInterval = (_action, _interval) => {
    action = _action;
    interval = _interval;
  };

  const fakeAction = () => {
    runs += 1;
  };

  const updater = Updater(fakeAction, options, fakeInterval);
  updater.start();

  t.is(interval, options.interval);
  t.is(runs, 1);

  action();
  t.is(runs, 2);
});

test('stop action', (t) => {
  const intervalId = 12374;
  const options = {};

  const fakeInterval = () => intervalId;

  let returnedId = null;
  const fakeClearInterval = (id) => {
    returnedId = id;
  };

  const updater = Updater(() => {}, options, fakeInterval, fakeClearInterval);
  updater.start();
  updater.stop();

  t.is(returnedId, intervalId);
});

test.cb('trigger onUpdate every execution', (t) => {
  t.plan(4);
  let numberOfUpdatesTriggered = 0;
  const options = {};

  let action = null;
  const fakeInterval = (_action) => {
    action = _action;
  };

  const fakeAction = () => Promise.resolve({});

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onUpdate(() => {
    numberOfUpdatesTriggered += 1;
    t.pass();

    if (numberOfUpdatesTriggered === 4) {
      t.end();
    }
  });

  updater.start();
  action();
  action();
  action();
});

test.cb('trigger onUpdate for each item received', (t) => {
  t.plan(3);
  let numberOfUpdatesTriggered = 0;
  const options = {};
  const fakeInterval = () => {};
  const response = ['data1', 'data2', 'data3'];


  const fakeAction = () => Promise.resolve(response);

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onUpdate((data) => {
    t.is(data, response[numberOfUpdatesTriggered]);

    if (numberOfUpdatesTriggered === 2) {
      t.end();
    }
    numberOfUpdatesTriggered += 1;
  });

  updater.start();
});

test.cb('returned data is passed to onUpdate callback', (t) => {
  const options = {};
  const actionData = { some: 'data' };

  const fakeInterval = () => {};

  const fakeAction = () => Promise.resolve(actionData);

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onUpdate((data) => {
    t.deepEqual(data, actionData);
    t.end();
  });

  updater.start();
});

test.cb('trigger onError when execution fails', (t) => {
  t.plan(1);
  const options = {};

  const fakeInterval = () => {};

  const expectedError = new Error('something went wrong');

  const fakeAction = () => Promise.reject(expectedError);

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onError((err) => {
    t.deepEqual(err, expectedError);
    t.end();
  });

  updater.start();
});

test.cb('able to register multiple onUpdate callbacks', (t) => {
  t.plan(2);
  const options = {};
  const actionData = { some: 'data' };

  const fakeInterval = () => {};

  const fakeAction = () => Promise.resolve(actionData);

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onUpdate((data) => {
    t.deepEqual(data, actionData);
    end();
  });

  updater.onUpdate((data) => {
    t.deepEqual(data, actionData);
    end();
  });

  let calls = 0;
  function end() {
    calls += 1;
    if (calls === 2) {
      t.end();
    }
  }

  updater.start();
});

test.cb('able to register multiple onError callbacks', (t) => {
  t.plan(2);
  const options = {};

  const fakeInterval = () => {};

  const expectedError = new Error('something went wrong');

  const fakeAction = () => Promise.reject(expectedError);

  const updater = Updater(fakeAction, options, fakeInterval);

  updater.onError((err) => {
    t.deepEqual(err, expectedError);
    end();
  });

  updater.onError((err) => {
    t.deepEqual(err, expectedError);
    end();
  });

  updater.start();

  let calls = 0;
  function end() {
    calls += 1;
    if (calls === 2) {
      t.end();
    }
  }
});
