# Sydney public transport realtime

Part of [services communication](https://github.com/viniciusgerevini/services-communication) experiment

Responsible for getting information about Sydney's public transport position in realtime.

Fetches data from  [Open Data NSW](https://opendata.transport.nsw.gov.au/)

*This service still under development*

## Set up

First you need to define the right configuration.
You can do it changing the configuration file located at `./configs/` or defining the following environment variables:

```sh
export REALTIME_API_URL="Sydney transport realtime URL"
export REALTIME_API_KEY="your Open Data api key"
```

To start services run:

```sh
make start
```

## How it works

The communication between the services is done through the message bus.

While idle, the service won't send updates.
The service only starts updating when the following message is received:

```json
{
   "name": "TRANSPORT_LIVE_POSITION_REQUESTED",
   "data": { "city": "AU_SYDNEY" }
}
```
If no message is received for 10 minutes the service becomes idle again.

On update an message like the following example is sent:

```json
{
  "name": "TRANSPORT_LIVE_POSITION_UPDATED",
  "data": {
    "city": "AU_SYDNEY",
    "id": "1234acd",
    "type": "bus",
    "trip_id": "123",
    "route_id": "abcd",
    "position": {
      "latitude": -30.0000000,
      "longitude": -29.000000,
    }
  },
  "version": 1,
  "date": 1516097850519
}
```

For now only `type` bus was implemented.

