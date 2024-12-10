FROM 845742683201.dkr.ecr.ap-south-1.amazonaws.com/node:14-alpine3.10

RUN mkdir -p /src/app

WORKDIR /src/app

COPY . /src/app

RUN apk add --no-cache git

RUN npm install

RUN npm run build

CMD [ "node", "server.js"]
