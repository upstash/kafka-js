include .env
export

build:
	rm -rf ./npm
	mkdir npm
	deno run --allow-all ./cmd/build.ts


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