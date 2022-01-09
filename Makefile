include .env
export

build:
	rm -rf ./npm
	mkdir npm
	deno run --allow-all ./cmd/build.ts


	node ./npm/test_runner.js --unhandled-rejections=strict
	npm --prefix=npm uninstall chalk
	

test:
	deno test --allow-all

node_example:
	npm --prefix=example install
	npx ts-node ./example/main.ts

fmt:
	deno fmt
	deno lint


test-npm:
	node ./npm/test_runner.js