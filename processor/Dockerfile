FROM node:12.16.2-alpine3.11

RUN mkdir /app
COPY index.js /app/
WORKDIR /app
ENTRYPOINT ["node", "/app/index.js"]
