FROM oven/bun:slim

RUN apt-get update

COPY ./package.json /app/
COPY ./dist/ /app/
COPY ./server/*.ts /app/

WORKDIR /app

RUN bun upgrade && bun install --production
EXPOSE $SERVER_PORT
CMD bun server.ts
