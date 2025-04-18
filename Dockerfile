# Stage 1: base image with Bun
FROM oven/bun:1 AS base
WORKDIR /divvi-app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

# Stage 2: copy dist and server.js
FROM base AS build
WORKDIR /divvi-app

COPY dist dist
COPY server.js server.js

# Stage 5: release stage
FROM oven/bun:1 AS release
WORKDIR /divvi-app

COPY --from=build /divvi-app/dist dist
COPY --from=build /divvi-app/server.js server.js

USER bun
EXPOSE 3000
ENTRYPOINT ["bun", "server.js"]