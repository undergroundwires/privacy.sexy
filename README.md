# privacy.sexy

> Web tool to enforce privacy & security best-practices on Windows, because privacy is sexy 🍑🍆

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/undergroundwires/privacy.sexy/issues)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/undergroundwires/privacy.sexy.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/undergroundwires/privacy.sexy/context:javascript)
[![Maintainability](https://api.codeclimate.com/v1/badges/3a70b7ef602e2264342c/maintainability)](https://codeclimate.com/github/undergroundwires/privacy.sexy/maintainability)
[![Tests status](https://github.com/undergroundwires/privacy.sexy/workflows/Test/badge.svg)](https://github.com/undergroundwires/privacy.sexy/actions)
[![Quality checks status](https://github.com/undergroundwires/privacy.sexy/workflows/Quality%20checks/badge.svg)](https://github.com/undergroundwires/privacy.sexy/actions)
[![Security checks status](https://github.com/undergroundwires/privacy.sexy/workflows/Security%20checks/badge.svg)](https://github.com/undergroundwires/privacy.sexy/actions)
[![Bump & release status](https://github.com/undergroundwires/privacy.sexy/workflows/Bump%20&&%20&release/badge.svg)](https://github.com/undergroundwires/privacy.sexy/actions)
[![Deploy status](https://github.com/undergroundwires/privacy.sexy/workflows/Build%20&%20deploy/badge.svg)](https://github.com/undergroundwires/privacy.sexy/actions)
[![Auto-versioned by bump-everywhere](https://github.com/undergroundwires/bump-everywhere/blob/master/badge.svg?raw=true)](https://github.com/undergroundwires/bump-everywhere)

[https://privacy.sexy](https://privacy.sexy)

## Why

- You don't need to run any compiled software on your system, just run the generated scripts.
- It's open source, both application & infrastructure is 100% transparent
  - Fully automated C/CD pipeline to AWS for provisioning serverless infrastructure using GitHub actions.
- Have full visibility into what the tweaks do as you enable them.
- Easily extendable

## Extend scripts

Fork it & add more scripts in [application.yaml](src/application/application.yaml) and send a pull request 👌

## Commands

- Setup and run
  - For development:
    - `npm install` to project setup.
    - `npm run serve` to compile & hot-reload for development.
  - Production (using Docker):
    - Build `docker build -t undergroundwires/privacy.sexy .`
    - Run `docker run -it -p 8080:8080 --rm --name privacy.sexy-1 undergroundwires/privacy.sexy`
- Prepare for production: `npm run build`
- Run tests: `npm run test:unit`
- Lint and fix files: `npm run lint`

## Architecture

### Application

- Powered by **TypeScript** + **Vue.js** 💪
  - and driven by **Domain-driven design**, **Event-driven architecture**, **Data-driven programming** concepts.
- Application uses highly decoupled models & services in different DDD layers.
  - **Domain layer** is where the application is modelled with validation logic.
  - **Presentation Layer**
    - Consists of Vue.js components & UI stuff.
    - Event driven as in components simply listens to events from the state and act accordingly.
  - **Application Layer**
    - Keeps the application state
      - The [state](src/application/State/ApplicationState.ts) is a mutable singleton & event producer.
    - The application is defined & controlled in a [single YAML file](src/application/application.yaml) (see [Data-driven programming](https://en.wikipedia.org/wiki/Data-driven_programming))

![DDD + vue.js](docs/app-ddd.png)

### AWS Infrastructure

[![AWS solution](docs/aws-solution.png)](https://github.com/undergroundwires/aws-static-site-with-cd)

- It uses infrastructure from the following repository: [aws-static-site-with-cd](https://github.com/undergroundwires/aws-static-site-with-cd)
  - Runs on AWS 100% serverless and automatically provisioned using [GitHub Actions](.github/workflows/).
  - Maximum security & automation and minimum AWS costs are the highest priorities of the design.

#### GitOps: CI/CD to AWS

- CI/CD is fully automated for this repo using different GIT events & GitHub actions.
  - Versioning, tagging, creation of `CHANGELOG.md` and releasing is automated using [bump-everywhere](https://github.com/undergroundwires/bump-everywhere) action
- Everything that's merged in the master goes directly to production.

[![CI/CD to AWS with GitHub Actions](docs/gitops.png)](.github/workflows/)
