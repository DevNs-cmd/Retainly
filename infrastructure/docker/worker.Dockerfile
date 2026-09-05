# Retainly Worker Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
CMD ["pnpm", "--filter", "api", "start:worker"]
