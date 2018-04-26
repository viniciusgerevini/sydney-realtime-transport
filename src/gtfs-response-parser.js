function feedResponseParser(decodeGtfsMessage) {
  return function parseGtfsMessage(body) {
    const feed = decodeGtfsMessage(body);
    return feed.entity.reduce(parseValidEntities, []);
  };
}

function parseValidEntities(acc, entity) {
  if (entity.vehicle && entity.vehicle.position) {
    acc.push(parseEntity(entity));
  }
  return acc;
}

function parseEntity(feed) {
  return {
    id: feed.id,
    type: 'bus',
    trip_id: feed.vehicle.trip.trip_id,
    route_id: feed.vehicle.trip.route_id,
    position: {
      latitude: feed.vehicle.position.latitude,
      longitude: feed.vehicle.position.longitude
    }
  };
}

module.exports = feedResponseParser;
