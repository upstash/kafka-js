include .env
export

build:
	rm -rf ./npm
	mkdir npm
	cp .env ./npm/.env
	deno run --allow-all ./cmd/build.ts


	npm --prefix=npm uninstall chalk
	

test:
	deno test --allow-all