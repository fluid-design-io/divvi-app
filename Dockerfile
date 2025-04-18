# Stage 1: base image with Bun
FROM oven/bun:1 AS base
WORKDIR /divvi-app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile


# Stage 5: release stage
FROM oven/bun:1 AS release
WORKDIR /divvi-app
COPY . .


USER bun
EXPOSE 3000
ENTRYPOINT ["bun", "run", "start:server"]