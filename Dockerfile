# Multi-stage build for SYMBI Synergy Platform

# Stage 1: Build the React frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:18-alpine as backend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 3: Production environment
FROM node:18-alpine
WORKDIR /app

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy backend files and node_modules
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/backend ./backend
COPY --from=backend-build /app/package*.json ./
COPY --from=backend-build /app/config ./config

# Create .env file from example if not exists
COPY --from=backend-build /app/.env.example ./.env.example
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
