# ---- build stage: has dev deps + TypeScript ----
# Start from the official Node.js 22 image on Alpine Linux (a small Linux distro).
# "AS builder" names this stage so the runtime stage can copy files out of it.
FROM node:22-alpine AS builder

# Set /app as the working directory. Later COPY and RUN commands run from here.
WORKDIR /app

# Enable Corepack, which ships with Node. It reads the "packageManager" / "devEngines"
# field in package.json and provides the matching pnpm version, so you don't install pnpm yourself.
RUN corepack enable

# Copy dependency manifests first so this layer stays cached
# Copy only package.json, the lockfile and the workspace config into /app.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies exactly as recorded in pnpm-lock.yaml.
# --frozen-lockfile fails the build if the lockfile is out of date instead of changing it.
RUN pnpm install --frozen-lockfile

# Now the source (changes often)
# Copy the rest of the project (src/, tsconfig.json, etc.) into /app.
COPY . .

# Compile TypeScript (src/ to dist/) using the "build" script in package.json (runs tsc).
RUN pnpm run build

# ---- runtime stage: only what's needed to run ----
# Start a fresh Node.js image. Nothing from the builder stage is kept unless copied below,
# so dev dependencies, TypeScript and the source code are not in the final image.
FROM node:22-alpine AS runtime


# RUN corepack enablDe
# # Set /app as the working directory for this stage.
WORKDIR /app
# # Set the NODE_ENV environment variable to "production" for this image.
# # Many libraries use it to turn off dev-only behavior and speed things up.
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=app2
ENV APP1_URL=http://app1:3000
# # package.json is needed because of "type": "module" (dist uses ESM imports)
# # Copy package.json from the builder into /app so Node knows the code is ESM.
COPY --from=builder /app/package.json ./

# # Copy the compiled JavaScript from the builder's dist/ folder into /app/dist.
COPY --from=builder /app/dist ./dist

# # Run the container as the non-root "node" user that the official image provides.
# # Running without root limits the damage if the app is compromised.
USER node

# # Document that the app listens on port 3000. This does not publish the port;
# # you still need -p 3000:3000 when running the container.
EXPOSE 3000

# # Default command when the container starts: run the compiled server.
# # The exec form (JSON array) makes node the main process, so it receives SIGTERM from "docker stop".
CMD ["node", "dist/index.js"]
