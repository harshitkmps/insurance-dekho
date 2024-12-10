FROM node:16.16.0-alpine3.16 as ts-remover
WORKDIR /usr/src/app
COPY . .
RUN apk --no-cache add --virtual builds-deps build-base python3
RUN npm install
RUN npm run build

FROM node:16.16.0-alpine3.16
LABEL product="central" maintainer="devesh.magotra@insurancedekho.com" application="api-gateway"
WORKDIR /usr/src/app
COPY --from=ts-remover /usr/src/app/dist/ ./
COPY --from=ts-remover /usr/src/app/swagger.json ../
COPY --from=ts-remover /usr/src/app/newrelic.js ./
COPY --from=ts-remover /usr/src/app/node_modules ./node_modules
COPY --from=ts-remover /usr/src/app/tracing.js ./
#CMD [ "node","-r","./tracing.js", "src/server.js" ]
CMD ["src/server.js"]
