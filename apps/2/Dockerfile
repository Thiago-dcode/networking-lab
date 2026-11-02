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
COPY apps/1/package.json ./apps/1/
COPY apps/2/package.json ./apps/2/
COPY apps/3/package.json ./apps/3/
COPY apps/proxy/package.json ./apps/proxy/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

# Install exactly what the lockfile records. --frozen-lockfile fails if it would need to change.
RUN pnpm install --frozen-lockfile

# ---- builder: compile this app ----
FROM base AS builder

COPY packages/core ./packages/core
COPY apps/2 ./apps/2

# "..." means this package AND its workspace dependencies, so @netlab/core is built first.
# app2 imports the router and helpers from core, which are read from its dist/ folder.
RUN pnpm --filter @netlab/app2... run build

# ---- deploy: standalone folder with production dependencies only ----
FROM builder AS deploy

# Copies app2's package.json, dist/ and production node_modules into /prod/app2.
# pnpm 12.2+ deploys workspace packages without extra settings (see apps/1/Dockerfile).
RUN pnpm --filter @netlab/app2 deploy --prod /prod/app2

# ---- dev: used by `docker compose watch`; runs tsx watch against the source ----
FROM base AS dev

COPY packages/core ./packages/core
COPY apps/2 ./apps/2

# Core is consumed through dist/, so build it once before app2 starts. Editing packages/core/src
# does not rebuild it in this stage (same as apps/1).
RUN pnpm --filter @netlab/core run build

# Run the dev script through the filter from the workspace root.
CMD ["pnpm", "--filter", "@netlab/app2", "dev"]

# ---- runtime: only what the app needs to run ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Production mode turns off dev-only behavior in many libraries.
# The port and any hosts come from .env (env_file in compose.yaml), not the image.
ENV NODE_ENV=production

# Copy the standalone output of "pnpm deploy".
COPY --from=deploy /prod/app2 ./

# Run as the non-root "node" user provided by the official image.
USER node

# Documents the default port. Compose decides what is actually published.
EXPOSE 3000

# Exec form: node is PID 1 and receives SIGTERM from "docker stop".
CMD ["node", "dist/index.js"]
