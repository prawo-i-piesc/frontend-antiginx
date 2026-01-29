# Build stage: compile the application
FROM node:24-alpine AS build

WORKDIR /app

# Copy the package files
COPY package.json ./
COPY package-lock.json ./

# Download the Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build argument for backend URL example
ARG NEXT_PUBLIC_BACKEND_URL=http://10.10.0.1:4000
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Build
RUN npm run build

# Final stage: a minimal image to run the application
FROM node:25-alpine AS runner

# Install ca-certificates
RUN apk --no-cache upgrade && \
    apk --no-cache add ca-certificates

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy only the necessary files from the build stage with correct ownership
COPY --from=build --chown=appuser:appgroup /app/.next ./.next
COPY --from=build --chown=appuser:appgroup /app/public ./public
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=build --chown=appuser:appgroup /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm install --only=production

# Change ownership of node_modules to appuser
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the application port and start the application
EXPOSE 3000
CMD ["npm", "run", "start"]
