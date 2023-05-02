# URL Shortener

This repo contains two TypeScript codebases to make a simple URL shortener.

- `api` provides an Express REST API
- `app` is a SvelteKit web app that uses the API

## Install

Clone the repository

```
$ git clone https://github.com/nmacmunn/url-shortener.git
$ cd url-shortener
```

### API

```
$ cd api
$ npm install
$ cp .env.example .env
```

Generate an API key for Google Safe Browsing API using the instructions [here](https://developers.google.com/safe-browsing/v4/get-started) and set GOOGLE_API_KEY.

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

Run `npm run dev` in each of the `api` and `app` folders.

[Open in browser](http://127.0.0.1:3000)

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
npx appmap-agent-js -- jest
```

Build.

```
npm run build
```

Generate AppMaps for API code.

```
npx appmap-agent-js -- node -r dotenv/config build
```

Note: you may need to remove the last line `//# sourceMappingURL=library.js.map` from `node_modules/@prisma/client/runtime/library.js` due to [this bug](https://github.com/getappmap/appmap-agent-js/issues/221).

## Docker

1. Install [Docker](https://docs.docker.com/engine/install/) for your platform
2. Kill `npm run dev` running in the `app` and `api` directories
3. Build and start with docker compose:

```
$ cd url-shortener
$ docker compose up -- build
```

[Open in browser](http://127.0.0.1:3000)
