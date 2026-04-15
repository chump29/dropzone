#!/usr/bin/env -S docker image build . --tag dropzonebot --file

FROM oven/bun:alpine AS build

WORKDIR /app

COPY . .

ENV BUN_INSTALL_CACHE_DIR=/.bun-cache

RUN --mount=type=cache,target=/.bun-cache \
  bun install --frozen-lockfile --ignore-scripts --production

# -=-

FROM oven/bun:alpine

WORKDIR /app

LABEL org.opencontainers.image.authors="Chris Post <admin@postfmly.com>" \
  org.opencontainers.image.description="DropZoneBot for Discord" \
  org.opencontainers.image.licenses="GPL-3.0-only" \
  org.opencontainers.image.title="DropZoneBot" \
  org.opencontainers.image.url="https://github.com/chump29/dropzonebot"

# hadolint ignore=DL3018
RUN apk add --no-cache tzdata

COPY --from=build /app /app/

ENV TZ=Etc/GMT

HEALTHCHECK --interval=60s CMD source healthcheck.sh

EXPOSE 8002

ENTRYPOINT ["bun", "run", "prod"]
