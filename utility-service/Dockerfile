# Stage-1 --- compiling ts files to js
FROM node:16.16-alpine3.15 as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install

RUN npm run-script build

EXPOSE 3000

# Stage-2 --- copying only the js files
FROM node:16.16-alpine3.15 as dist-build-stage

WORKDIR /app

COPY --from=common-build-stage /app/package*.json ./

COPY --from=common-build-stage /app/dist ./

COPY --from=common-build-stage /app/.env* ./

RUN npm install --only-production

# Stage-3 --- building distroless image from last stage
# FROM gcr.io/distroless/nodejs:16
FROM node:16.16-alpine3.15

WORKDIR /app

COPY --from=dist-build-stage /app ./

CMD ["server.js"]
