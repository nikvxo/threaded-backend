# Multi-stage Dockerfile for threaded-backend

# Build stage
FROM node:20.19-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source and generate prisma client
COPY . .
RUN npx prisma generate

# Production stage
FROM node:20.19-alpine AS runner
WORKDIR /app

# Install production deps
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy app code and generated client from builder
COPY --from=builder /app .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
