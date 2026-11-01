# Variables
ARG USERNAME=antiginx_user
ARG GROUPNAME=antiginx_group
ARG USER_UID=1001
ARG USER_GID=1001
# ---


# Base image for stages
FROM node:24-alpine AS base
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

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build
RUN npm prune --production
# ---


# STAGE: Final image to run the application
FROM base AS runner

ARG USERNAME
ARG GROUPNAME
ARG USER_UID
ARG USER_GID

ENV NODE_ENV=production

WORKDIR /app

RUN apk --no-cache upgrade &&                                                      \
    apk --no-cache add ca-certificates &&                                          \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack    \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack           \
           /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

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