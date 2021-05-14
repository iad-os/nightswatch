# Stage-0 run tests & build
FROM node:14-stretch as buildTs
WORKDIR /app
COPY . .
RUN npm ci \
    && npm run build\  
    && rm -rf ./src \
    && rm -rf src backup coverage docs node_modules


# Stage-1 prod dependencies
FROM mhart/alpine-node:14 as prodDeps
WORKDIR /app
COPY package*.json ./
RUN npm ci --prod


# Stage-2 final image
FROM mhart/alpine-node:slim-14
RUN addgroup -g 1000 node \
    && adduser -u 1000 -G node -D node 
RUN apk --no-cache add curl
# Create app directory
WORKDIR /app
COPY --chown=node:node --from=prodDeps /app .
# Bundle app source
COPY --chown=node:node --from=buildTs /app .
USER node
EXPOSE 3000
#ENTRYPOINT [ "sleep", "1800" ]
ENTRYPOINT [ "node", "dist/index.js" ]

