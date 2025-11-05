# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build && \
    cd dist && \
    find . -name "*.js" -type f -exec sed -i 's|src/configs/|../configs/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/services/|../services/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/utils/|../utils/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/db/|../db/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/interfaces/|../interfaces/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/core/|../core/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/router/|../router/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/controllers/|../controllers/|g' {} \; && \
    find . -name "*.js" -type f -exec sed -i 's|src/middlewares/|../middlewares/|g' {} \;

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/knexfile.js ./knexfile.js
COPY --from=builder /app/src/swagger ./dist/swagger

# Create upload directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 10093

# Start application
CMD ["npm", "start"]

