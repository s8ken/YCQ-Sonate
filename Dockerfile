# Multi-stage build for SYMBI Trust Protocol - Security Hardened

# Stage 1: Build the React frontend
FROM node:18-alpine as frontend-build

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:18-alpine as backend-build

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --only=production && npm cache clean --force

# Copy backend source
COPY . .

# Remove unnecessary files
RUN rm -rf frontend .git .env.production

# Stage 3: Production environment - Security Hardened
FROM node:18-alpine

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S symbi -u 1001 -G nodejs

WORKDIR /app

# Copy built frontend from stage 1
COPY --from=frontend-build --chown=symbi:nodejs /app/frontend/build ./frontend/build

# Copy backend files and node_modules
COPY --from=backend-build --chown=symbi:nodejs /app/node_modules ./node_modules
COPY --from=backend-build --chown=symbi:nodejs /app/backend ./backend
COPY --from=backend-build --chown=symbi:nodejs /app/package*.json ./
COPY --from=backend-build --chown=symbi:nodejs /app/config ./config

# Create .env file from example if not exists (but don't copy production secrets)
COPY --from=backend-build --chown=symbi:nodejs /app/.env.example ./.env.example
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Create necessary directories with proper permissions
RUN mkdir -p logs temp uploads && \
    chown -R symbi:nodejs logs temp uploads && \
    chmod 755 logs temp uploads

# Switch to non-root user
USER symbi

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Expose the port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
