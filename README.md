# URL Shortener

A simple URL shortener featuring:

- Custom slugs (aliases)
- View counting
- Deletable links
- Account-less link management

This repo contains two TypeScript codebases.

- `api` provides an Express REST API
- `app` is a SvelteKit web app that uses the API

Other tech details:

- Docker for containerization
- PostgreSQL for persistence
- Prisma for migrations <code><strike>and ORM</strike></code>
- AppMap for dynamic analysis

## Install

Clone the repository

```
$ git clone https://github.com/nmacmunn/url-shortener.git
$ cd url-shortener
```

### Database

Install [Docker](https://docs.docker.com/engine/install/) for your platform and pull the postgres image.

```
$ docker pull postgres
```

Start the database so we can run migrations in the next step.

```
docker run -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 postgres
```

### API

```
$ cd api
$ npm install
$ cp .env.example .env
$ cp .env.example .env.test
```

Generate an API key for Google Safe Browsing API using the instructions [here](https://developers.google.com/safe-browsing/v4/get-started) and set GOOGLE_API_KEY in `.env` and `.env.test`.

Set PGDATABASE to something else in `.env.test` otherwise running tests will clobber your development database.

Initialize the database

```
$ npm run migrate:dev
$ npm run migrate:test
```

### App

```
$ cd ../app
$ npm install
$ cp .env.example .env
```

## Develop

With the database running, start `npm run dev` in each of the `api` and `app` folders and then open http://127.0.0.1:3000

## Test

Run API tests

```
$ npm test
```

Watch API tests

```
$ npm run test:watch
```

## API AppMap

The following commands are all performed in the `api` directory.

Generate AppMaps for tests.

```
npm run test:appmap
```

Generate AppMaps for process.

```
npm run preview:appmap
```

Note: you may need to remove the last line `//# sourceMappingURL=library.js.map` from `node_modules/@prisma/client/runtime/library.js` due to [this bug](https://github.com/getappmap/appmap-agent-js/issues/221).

## Docker

First, kill `npm run dev` if still running in the `app` and `api`.

Create a top-level `.env`.

```
cp .env.example .env
```

Build and start with docker compose:

```
$ docker compose up -- build
```

Run the database migration.

```
$ cd api
$ npm run migrate:dev
```

Open http://127.0.0.1:3000
