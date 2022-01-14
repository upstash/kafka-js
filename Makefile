include .env
export

GIT_TAG := $(shell git describe --tags --abbrev=0)

build:
ifdef version
	@echo "Building using specified version: $(version)"
else
	$(eval version = $(GIT_TAG))
	@echo "Building using the most recent git tag: $(version)"
endif

	rm -rf ./npm
	mkdir -p npm
	deno run --allow-all ./cmd/build.ts $(version)

	node ./npm/test_runner.js --unhandled-rejections=strict
	npm --prefix=npm uninstall chalk
	
test:
	rm -rf coverage || true
	deno run --allow-all ./cmd/removeConsumerGroups.ts
	deno test --allow-all --unstable --coverage=coverage
	deno coverage coverage --lcov > coverage/lcov.info
	deno coverage coverage

run-example:
	npm --prefix=example install
	example/node_modules/.bin/esbuild --platform=node --bundle --target=node14 ./example/main.ts | node

fmt:
	deno fmt
	deno lint

test-npm:
	node ./npm/test_runner.js