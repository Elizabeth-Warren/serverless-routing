build:
	docker build . -t serverless-routing

tests:
	make build
	docker run --rm serverless-routing
