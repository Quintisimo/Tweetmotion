FROM node:current-alpine

COPY . /app
WORKDIR /app

RUN npm install && \
  npm run build-server && \
  npm run build-client && \
  npm prune --production

WORKDIR /app/src/server-build
CMD [ "node", "server.js" ]