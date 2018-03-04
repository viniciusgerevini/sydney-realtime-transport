import test from 'ava';
import gtfsParser from './gtfs-response-parser';

test('parse bus object', (t) => {
  const fakeDecoder = message => message;

  const parser = gtfsParser(fakeDecoder);

  const feedObject = {
    id: 'someid',
    vehicle: {
      trip: {
        trip_id: '577478',
        route_id: '2433_T75'
      },
      position: {
        latitude: -33.74142074584961,
        longitude: 150.91769409179688,
        bearing: 185,
        odometer: null,
        speed: 14.800000190734863
      }
    }
  };
  const feed = {
    entity: [feedObject]
  };

  const expected = [{
    id: feedObject.id,
    type: 'bus',
    trip_id: feedObject.vehicle.trip.trip_id,
    route_id: feedObject.vehicle.trip.route_id,
    position: {
      latitude: feedObject.vehicle.position.latitude,
      longitude: feedObject.vehicle.position.longitude
    }
  }];

  t.deepEqual(parser(feed), expected);
});

test('should exclude objects without position', (t) => {
  const fakeDecoder = message => message;
  const parser = gtfsParser(fakeDecoder);

  const feedObject = {
    id: 'someid',
    vehicle: {
      trip: {
        trip_id: '577478',
        route_id: '2433_T75'
      },
      position: {
        latitude: -33.74142074584961,
        longitude: 150.91769409179688,
        bearing: 185,
        odometer: null,
        speed: 14.800000190734863
      }
    }
  };

  const badObject = {
    id: 'badid',
    vehicle: {
      trip: {},
      position: null
    }
  };

  const feed = {
    entity: [
      feedObject,
      badObject,
      { id: 'wrong' }
    ]
  };

  const expected = [{
    id: feedObject.id,
    type: 'bus',
    trip_id: feedObject.vehicle.trip.trip_id,
    route_id: feedObject.vehicle.trip.route_id,
    position: {
      latitude: feedObject.vehicle.position.latitude,
      longitude: feedObject.vehicle.position.longitude
    }
  }];

  t.deepEqual(parser(feed), expected);
});
