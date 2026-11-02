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

COPY apps/proxy ./apps/proxy

# No workspace dependencies, so the filter names only this app.
RUN pnpm --filter @netlab/proxy run build

# ---- deploy: standalone folder with production dependencies only ----
FROM builder AS deploy

# Copies the proxy's package.json and dist/ into /prod/proxy. It has no runtime
# dependencies, so the production node_modules is empty.
# pnpm 12.2+ deploys workspace packages without extra settings (see apps/1/Dockerfile).
RUN pnpm --filter @netlab/proxy deploy --prod /prod/proxy

# ---- dev: used by `docker compose watch`; runs tsx watch against the source ----
FROM base AS dev

COPY apps/proxy ./apps/proxy

# Run the dev script through the filter from the workspace root.
CMD ["pnpm", "--filter", "@netlab/proxy", "dev"]

# ---- runtime: only what the app needs to run ----
FROM node:22-alpine AS runtime

WORKDIR /app

# Production mode turns off dev-only behavior in many libraries.
# APP1_HOST, APP1_PORT, APP2_HOST and so on come from .env at run time, not from the image.
ENV NODE_ENV=production

# Copy the standalone output of "pnpm deploy".
COPY --from=deploy /prod/proxy ./

# Run as the non-root "node" user provided by the official image.
USER node

# Documents the default port. Compose decides what is actually published.
EXPOSE 3000

# Exec form: node is PID 1 and receives SIGTERM from "docker stop".
CMD ["node", "dist/index.js"]
