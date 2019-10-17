FROM node:current-alpine

COPY . /app
WORKDIR /app

RUN npm install && \
  npm run build-server && \
  npm run build-client && \
  npm prune --production

WORKDIR /app/src/server-build
EXPOSE 5000
ENV NODE_ENV production
ENTRYPOINT [ "node", "server.js" ]