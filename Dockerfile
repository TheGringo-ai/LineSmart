# Multi-stage build for LineSmart Platform
FROM node:20-alpine as frontend-build

# Set working directory for frontend build
WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install frontend dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts && npm cache clean --force

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the React app for production
RUN npm run build

# Production stage - Node.js server that serves both API and frontend
FROM node:20-alpine

# Install security updates
RUN apk upgrade --no-cache

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S linesmart -u 1001

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci --legacy-peer-deps --ignore-scripts && npm cache clean --force

# Copy server source code
COPY server/ ./

# Copy the built frontend from the build stage
COPY --from=frontend-build /app/build ./build

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R linesmart:nodejs /app

# Switch to non-root user
USER linesmart

# Expose port 8080 (Google Cloud Run requirement)
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start the production server (serves both API and frontend)
CMD ["node", "production.js"]
