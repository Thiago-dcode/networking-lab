# Build context is the REPO ROOT (see compose.yaml: context: .).
# Paths below start from the repo root so pnpm can see the whole workspace and its lockfile.

# ---- base: shared install layer, used by builder and dev ----
FROM node:22-alpine AS base

# Every later step runs from /app, which mirrors the repo layout (apps/, packages/).
WORKDIR /app

# Enable Corepack (bundled with Node). It reads "packageManager" in the root package.json
# and provides the pinned pnpm version.
RUN corepack enable

# Copy only the manifests, so this install layer is cached until a dependency changes.
# pnpm must see the package.json of EVERY workspace project, because pnpm-lock.yaml
# records all of them. Missing one makes --frozen-lockfile fail.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/app1/package.json ./apps/app1/
COPY apps/app2/package.json ./apps/app2/
COPY apps/app3/package.json ./apps/app3/
COPY apps/proxy/package.json ./apps/proxy/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

# Install exactly what the lockfile records. --frozen-lockfile fails if it would need to change.
RUN pnpm install --frozen-lockfile

# ---- builder: compile this app ----
FROM base AS builder

COPY apps/web ./apps/web

# No workspace dependencies, so the filter names only this app.
RUN pnpm --filter @netlab/web run build

# tsc only compiles .ts files. The HTML pages are not copied to dist/, but the server reads them
# from dist/views (VIEWS_PATH resolves to <dist/utils>/../views). Copy them in explicitly.
RUN cp -r apps/web/src/views apps/web/dist/views

# ---- deploy: standalone folder with production dependencies only ----
FROM builder AS deploy

# Copies the web package.json, dist/ (including dist/views) into /prod/web.
# pnpm 12.2+ deploys workspace packages without extra settings (see apps/app1/Dockerfile).
RUN pnpm --filter @netlab/web deploy --prod /prod/web

# ---- dev: used by `docker compose watch`; runs tsx watch against the source ----
FROM base AS dev

COPY apps/web ./apps/web

# The dev server reads views straight from src/views, so no copy step is needed here.
CMD ["pnpm", "--filter", "@netlab/web", "dev"]

# ---- runtime: only what the app needs to run ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Production mode turns off dev-only behavior in many libraries.
# WEB_PORT, PROXY_HOST and PROXY_PORT come from .env at run time, not from the image.
ENV NODE_ENV=production

# Copy the standalone output of "pnpm deploy", including dist/views.
COPY --from=deploy /prod/web ./

# Run as the non-root "node" user provided by the official image.
USER node

# Documents the default port. Compose decides what is actually published.
EXPOSE 3000

# Exec form: node is PID 1 and receives SIGTERM from "docker stop".
CMD ["node", "dist/index.js"]
