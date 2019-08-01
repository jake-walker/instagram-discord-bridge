FROM node:10-alpine

RUN mkdir -p /app

WORKDIR /app
COPY * ./
RUN yarn install

CMD ["node", "/app/index.js"]