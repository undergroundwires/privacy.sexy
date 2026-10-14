.DEFAULT_GOAL := help

NPM ?= npm

.PHONY: help test-fast test lint coverage build check ci-local

help:
	@echo "test-fast  - Unit tests with non-executing boundaries"
	@echo "test       - Safe unit and application integration tests"
	@echo "lint       - ESLint without external URL or Python checks"
	@echo "coverage   - Safe tests with production-source V8 coverage"
	@echo "build      - Type-check and build the web application"
	@echo "check      - Type-check, lint, safe tests, and web build"
	@echo "ci-local   - GitHub workflow checks in Docker (Linux legs)"

test-fast:
	$(NPM) run test:fast

test:
	$(NPM) run test:safe

lint:
	$(NPM) run lint:eslint

coverage:
	$(NPM) run test:coverage

build:
	$(NPM) run build

check:
	$(NPM) run check:quality

ci-local:
	$(NPM) run ci:local
