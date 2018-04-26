.PHONY: lint
lint:
	docker-compose run --rm dev yarn lint

.PHONY: test
test:
	docker-compose run --rm dev yarn test

.PHONY: test.watch
test.watch:
	docker-compose run --rm dev yarn test:watch

.PHONY: start
start:
	docker-compose up -d server messagebus

.PHONY: stop
stop:
	docker-compose stop server messagebus
