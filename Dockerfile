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

# Build
RUN npm run build


# Final stage: a minimal image to run the application
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Install only production dependencies
RUN npm install --only=production

EXPOSE 3000
CMD ["npm", "run", "start"]