# Variables
ARG NPM_VERSION=11.13.0
ARG NEXT_PUBLIC_BACKEND_URL=http://10.10.0.1:4000

ARG USERNAME=antiginx_user
ARG GROUPNAME=antiginx_group
ARG USER_UID=1001
ARG USER_GID=1001
# ---


# Base image for stages
FROM node:25-alpine AS base
# ---


# STAGE: Install dependencies
FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json  ./
COPY package-lock.json ./

RUN \
    if [ -f package-lock.json ] && [ -f package.json ]; then          \
        npm ci;                                                       \
    else                                                              \
        echo "No package.json or package-lock.json found" && exit 1;  \
    fi
# ---


# STAGE: Build the application
FROM base AS build

ARG NEXT_PUBLIC_BACKEND_URL

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build
RUN npm prune --production
# ---


# STAGE: Final image to run the application
FROM base AS runner

ARG NPM_VERSION
ARG USERNAME
ARG GROUPNAME
ARG USER_UID
ARG USER_GID

ENV NODE_ENV=production

WORKDIR /app

RUN apk --no-cache upgrade &&              \
    apk --no-cache add ca-certificates &&  \
    npm install -g npm@${NPM_VERSION}

RUN addgroup -g ${USER_GID} -S ${GROUPNAME}
RUN adduser -u ${USER_UID} -S ${USERNAME} -G ${GROUPNAME}

COPY --from=build --chown=${USERNAME}:${GROUPNAME} /app/public ./public

COPY --from=build --chown=${USERNAME}:${GROUPNAME} /app/.next/standalone ./
COPY --from=build --chown=${USERNAME}:${GROUPNAME} /app/.next/static ./.next/static

USER ${USERNAME}

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
# ---