# Build stage: compile the application
FROM node:20-alpine AS build

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
FROM node:20-alpine AS runner

# Install ca-certificates
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm install --only=production

EXPOSE 3000
CMD ["npm", "run", "start"]
