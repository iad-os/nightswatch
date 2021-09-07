# Stage-1 dependencies
FROM node:14-alpine as deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --prod

# Stage-2 final image
FROM node:14-alpine
# Create app directory
WORKDIR /app
COPY --from=deps /app .
# Bundle app source
COPY . .
EXPOSE 3000
ENTRYPOINT [ "node", "src/index.js" ]


