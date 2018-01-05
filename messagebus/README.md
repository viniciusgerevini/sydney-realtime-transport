# message bus

Simple Eventbus created using NCHAN.
Exposes `/pub` and `/sub` routes.

### Example test commands:

Subscribe:

```sh
curl --request GET -i -k -H "Accept: text/event-stream" http://localhost:8080/sub
```

Publish:
```sh
curl -i --request POST --data '{"message": "some message"}' http://localhost:8080/pub
```
