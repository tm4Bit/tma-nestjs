<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Docker

### Development (API + MariaDB + Redis)

```bash
$ docker compose -f docker-compose.dev.yml up --build
```

If you prefer a shorter workflow, use the Makefile targets:

```bash
$ make up
$ make test
$ make lint
```

Common targets (all run inside the API container):

- `make up` / `make down`
- `make build`
- `make logs`
- `make shell`
- `make start`
- `make dbinit`
- `make lint`
- `make test`
- `make test-watch`

Defaults used by the dev compose:

- API: `PORT=8080`
- MariaDB: `DB_HOST=mariadb`, `DB_PORT=3306`, `DB_NAME=app`, `DB_USER=app`, `DB_PASSWORD=app`
- Redis: `REDIS_HOST=redis`, `REDIS_PORT=6379`, `REDIS_PASSWORD=`

You can override any value with environment variables.

### Database schema workflow (development)

- `src/database/schema.sql` is the single source of truth for the local schema.
- To initialize or refresh local DB schema, run `make dbinit`.
- `dbinit` is destructive by design: it drops and recreates the dev database before applying `src/database/schema.sql`.
- When production schema changes, replace `src/database/schema.sql` with the new dump and run `make dbinit` again.
- Ownership: keep `src/database/schema.sql` updated in this repository; do not maintain parallel migration history for dev setup.

### Production (API only)

```bash
$ docker compose -f docker-compose.prod.yml up --build
```

Required env vars for prod compose:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `PORT` (optional, defaults to 3000)

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Error responses (RFC 7807)

The API returns errors in Problem Details format (`application/problem+json`).

Base fields in every error response:

- `type`
- `title`
- `status`
- `detail`
- `instance`

Validation errors also include an `errors` extension with field-level details.

Example: validation error (`400`)

```json
{
  "type": "https://api.ovlk.local/problems/validation-error",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/blog-posts?limit=0",
  "errors": [
    {
      "path": "limit",
      "message": "Too small",
      "code": "too_small"
    }
  ]
}
```

Example categories:

- HTTP exceptions: `https://api.ovlk.local/problems/http-exception`
- Validation errors: `https://api.ovlk.local/problems/validation-error`
- Database conflict (`409`): `https://api.ovlk.local/problems/database-conflict`
- Database unavailable (`503`): `https://api.ovlk.local/problems/database-unavailable`
- Unexpected errors (`500`): `https://api.ovlk.local/problems/unexpected-error`

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
