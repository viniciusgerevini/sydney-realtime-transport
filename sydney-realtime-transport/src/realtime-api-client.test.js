import test from 'ava';
import realtimeApiClient from './realtime-api-client';

const options = {
  busesUrl: 'http://base-buse.url',
  apiKey: 'mySecretToken'
};

function setupStubs() {
  const httpClientStub = {
    get(request, callback) {
      this.lastRequest = request;
      this.onNextGetRequest(request);
      setTimeout(() => {
        callback(this.error, null, this.body);
        this.error = null;
        this.body = null;
      });
    },
    onNextGetRequest() {},
    fail(error) {
      this.error = error;
    },
    pass(body) {
      this.body = body;
    }
  };

  const parseGtfsStubData = {
    lastData: null,
    response: null
  };

  const parseGtfsStub = (data) => {
    parseGtfsStubData.lastData = data;
    return parseGtfsStubData.response;
  };

  return {
    httpClientStub,
    parseGtfsStub,
    parseGtfsStubData
  };
}

test('fetch and parse buses positions when success', async (t) => {
  const stubs = setupStubs();
  const apiClient = realtimeApiClient(options, stubs.httpClientStub, stubs.parseGtfsStub);
  const apiResponse = { some: 'message' };

  stubs.httpClientStub.pass(apiResponse);
  stubs.parseGtfsStubData.response = { some: 'data ' };

  const buses = await apiClient.fetchBusesPositions();

  t.is(stubs.httpClientStub.lastRequest.url, options.busesUrl);
  t.deepEqual(buses, stubs.parseGtfsStubData.response);
  t.deepEqual(stubs.parseGtfsStubData.lastData, apiResponse);
});

test('set proper headers for buses request', async (t) => {
  const stubs = setupStubs();
  const apiClient = realtimeApiClient(options, stubs.httpClientStub, stubs.parseGtfsStub);

  await apiClient.fetchBusesPositions();

  t.deepEqual(stubs.httpClientStub.lastRequest, {
    url: options.busesUrl,
    encoding: null,
    headers: {
      Accept: 'application/x-google-protobuf',
      Authorization: `apikey ${options.apiKey}`
    }
  });
});
