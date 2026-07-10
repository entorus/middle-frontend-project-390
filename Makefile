.PHONY: install build start

install:
	npm ci
	npm --prefix code ci

build:
	npm --prefix code run build

start:
	./node_modules/.bin/frontend-flight-booking-server start -s code/dist
