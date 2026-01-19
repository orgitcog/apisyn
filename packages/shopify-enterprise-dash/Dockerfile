# Build stage
FROM node:20-alpine AS builder

# Set build argument for version
ARG APP_VERSION=dev

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy source code
COPY . .

# Set version
ENV VITE_APP_VERSION=${APP_VERSION}

# Build the application
RUN yarn build:production

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remix

# Enable corepack
RUN corepack enable

# Copy built assets from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/node_modules ./node_modules

# Set ownership
RUN chown -R remix:nodejs /app

USER remix

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["yarn", "start"]
