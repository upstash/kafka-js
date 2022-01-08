include .env
export

build:
	rm -rf ./npm
	mkdir npm
	deno run --allow-all ./cmd/build.ts


	node ./npm/test_runner.js --unhandled-rejections=strict
	# npm --prefix=npm uninstall chalk
	

test:
	deno test --allow-all

release:
	npx release-it