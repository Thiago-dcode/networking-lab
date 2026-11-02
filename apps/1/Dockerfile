# Build context is the REPO ROOT (see compose.yaml: context: .), not apps/1.
# That's why every COPY path below starts from the repo root: this app depends on
# packages/core, and pnpm needs the root lockfile and workspace config to resolve the workspace.

# ---- base: shared install layer, used by builder and dev ----
# Node 22 on Alpine: a small Linux image with Node preinstalled.
FROM node:22-alpine AS base

# Every later RUN/COPY/CMD runs from /app, which mirrors the repo layout (apps/, packages/).
WORKDIR /app

# Enable Corepack (bundled with Node). It reads "packageManager" in the root package.json
# and provides the pinned pnpm version, so pnpm itself doesn't need installing.
RUN corepack enable

# Copy only the manifests first. Docker caches each layer, so this install layer is reused
# until a package.json or the lockfile changes. Source-code edits don't re-run the install.
#
# pnpm must see the package.json of EVERY workspace project, not just the ones this app uses,
# because pnpm-lock.yaml records all of them. Missing one makes --frozen-lockfile fail.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/1/package.json ./apps/1/
COPY apps/2/package.json ./apps/2/
COPY apps/3/package.json ./apps/3/
COPY apps/proxy/package.json ./apps/proxy/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

# Install exactly what pnpm-lock.yaml records. --frozen-lockfile fails the build if the
# lockfile would need to change, so builds stay reproducible.
RUN pnpm install --frozen-lockfile

# ---- builder: compile the app and its workspace dependency ----
FROM base AS builder

# Now the source code (changes often, so it comes after the install layer).
COPY packages/core ./packages/core
COPY apps/1 ./apps/1

# "--filter @netlab/app1..." means this package AND its dependencies. pnpm builds
# @netlab/core first, which produces packages/core/dist that app1 imports at runtime.
# Plain "pnpm run build" would run "pnpm -r run build" and try to build every app,
# including ones this image doesn't copy.
RUN pnpm --filter @netlab/app1... run build

# ---- deploy: assemble a standalone folder for the runtime image ----
FROM builder AS deploy

# "pnpm deploy" copies app1 into /prod/app1 with its production dependencies and the local
# packages it uses (@netlab/core, with its built dist/). The workspace symlinks become real
# files, so the result runs without the rest of the repo.
# pnpm 12.2+ deploys workspace packages without the inject-workspace-packages setting. It rewrites
# @netlab/core to a local file: dependency in a deploy-specific lockfile. If two versions of a peer
# dependency compete, the deploy fails with ERR_PNPM_DEPLOY_AMBIGUOUS_PEER and names the package.
RUN pnpm --filter @netlab/app1 deploy --prod /prod/app1

# ---- dev: used by `docker compose watch`; runs `tsx watch` against the source ----
FROM base AS dev

COPY packages/core ./packages/core
COPY apps/1 ./apps/1

# Core is consumed through dist/, so it must be built once before app1 can start.
# Editing packages/core/src does NOT rebuild automatically in this stage. Rebuild with
# `pnpm --filter @netlab/core run build` in the container, or restart the service after a rebuild.
RUN pnpm --filter @netlab/core run build

# The dev script ("tsx watch src/index.ts") lives in apps/1, so run it through the filter
# from the workspace root instead of "pnpm dev" in /app (which has no dev script).
CMD ["pnpm", "--filter", "@netlab/app1", "dev"]

# ---- runtime: only the files needed to run the app ----
# A fresh Node image. Nothing from builder or dev is kept unless copied in below, so there
# is no TypeScript, source code, pnpm, or dev dependency in the final image.
FROM node:22-alpine AS runtime

WORKDIR /app

# NODE_ENV=production turns off dev-only behavior in many libraries.
# Port and service hosts come from .env (env_file in compose.yaml), not from the image,
# so the same image can run with different addresses.
ENV NODE_ENV=production

# Copy the self-contained output of "pnpm deploy": package.json, node_modules, dist/.
COPY --from=deploy /prod/app1 ./

# Run as the non-root "node" user that the official Node image provides. If the app is
# compromised, the attacker has fewer rights.
USER node

# Documents the port the app listens on. It does not publish the port; compose does that.
EXPOSE 3000

# Exec form: node runs as PID 1 and receives SIGTERM from "docker stop", which the app
# handles to shut down cleanly.
CMD ["node", "dist/index.js"]
