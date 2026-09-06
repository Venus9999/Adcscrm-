# Production Dockerfile for Google Cloud Run
FROM node:22-slim

WORKDIR /app

# Ensure non-interactive environment
ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=8080

# 1. Install all dependencies
COPY package*.json ./
RUN npm install --include=dev

# 2. Copy source code and build production client and server bundles
COPY . .
RUN npm run build

# 3. Prune devDependencies to keep image lightweight and secure
RUN npm prune --omit=dev

# 4. Ensure data directory exists
RUN mkdir -p /app/data /app/data/backups

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/server.cjs"]


