const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const feedResponseParser = require('./gtfs-response-parser');

const gtfsDecoder = GtfsRealtimeBindings.FeedMessage.decode;

function realtimeApiClient(
  options,
  httpClient = request,
  parseGtfsMessage = feedResponseParser(gtfsDecoder)
) {
  return {
    fetchBusesPositions() {
      return makeRequest(options, httpClient, parseGtfsMessage);
    }
  };
}

function makeRequest(options, httpClient, parseGtfsMessage) {
  return new Promise((resolve, reject) => {
    httpClient.get({
      url: options.busesUrl,
      encoding: null,
      headers: {
        Accept: 'application/x-google-protobuf',
        Authorization: `apikey ${options.apiKey}`
      }
    }, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseGtfsMessage(body));
      }
    });
  });
}

module.exports = realtimeApiClient;
