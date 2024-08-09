FROM oven/bun:slim

# ffmpeg is used by the server for its ffprobe util in one of the endpoints.
# unzip is needed for Bun to process an upgrade.
RUN apt-get update && apt-get install ffmpeg unzip -y

COPY ./package.json /app/
COPY ./dist/ /app/
COPY ./server/*.ts /app/

WORKDIR /app

RUN bun upgrade && bun install --production
EXPOSE $SERVER_PORT
CMD bun server.ts
