FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM base AS dev

WORKDIR /app

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=base /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
