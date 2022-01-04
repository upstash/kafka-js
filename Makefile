release:
	rm -rf ./npm
	deno run --allow-all ./cmd/build.ts


	npm --prefix=npm uninstall chalk
	