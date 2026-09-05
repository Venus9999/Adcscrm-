# Production Dockerfile for Google Cloud Run
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir -p /app/data /app/data/backups
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data
RUN mkdir -p /app/data /app/data/backups

EXPOSE 8080
CMD ["node", "dist/server.cjs"]

