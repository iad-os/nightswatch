# Stage-1 dependencies
FROM mhart/alpine-node:12 as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --prod

# Stage-2 final image
FROM mhart/alpine-node:slim-12
# Create app directory
WORKDIR /app
COPY --from=deps /app .
# Bundle app source
COPY . .
EXPOSE 3000
ENTRYPOINT [ "node", "src/index.js" ]


