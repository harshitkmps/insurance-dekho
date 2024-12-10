FROM 724772087967.dkr.ecr.ap-south-1.amazonaws.com/node:20.10-alpine3.17 as ts-remover
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build

FROM 724772087967.dkr.ecr.ap-south-1.amazonaws.com/node:20.10-alpine3.17

WORKDIR /usr/src/app
COPY --from=ts-remover /usr/src/app/dist/ ./
COPY --from=ts-remover /usr/src/app/node_modules ./node_modules
COPY --from=ts-remover /usr/src/app/views ./views

CMD ["main.js"]