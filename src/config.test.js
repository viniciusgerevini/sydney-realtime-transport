import test from 'ava';
import config from './config';

test('load file for environment provided', (t) => {
  const expectedResponse = { some: 'data' };
  let fileRequested;
  const fakeFs = {
    readFileSync(filename) {
      fileRequested = filename;
      return JSON.stringify(expectedResponse);
    }
  };

  const returnedConfiguration = config.load('DEV', {}, fakeFs);

  t.deepEqual(returnedConfiguration, expectedResponse);
  t.is(fileRequested, './configs/DEV.json');
});

test('define values on environment variables to fields', (t) => {
  const response = {
    some: 'data',
    fromEnv: '{{ENV_VAR}}',
    nested: {
      fromEnv: '{{ENV_VAR}}',
      notFromEnv: 'test'
    },
    notInEnv: '{{NOT_AVAILABLE}}'
  };

  const environmentVariables = {
    PWD: '/test',
    ENV_VAR: 'data from env'
  };

  const fakeFs = {
    readFileSync() {
      return JSON.stringify(response);
    }
  };

  const returnedConfiguration = config.load('DEV', environmentVariables, fakeFs);

  t.deepEqual(returnedConfiguration, {
    some: 'data',
    fromEnv: 'data from env',
    nested: {
      fromEnv: 'data from env'
    },
    notInEnv: ''
  });
});
