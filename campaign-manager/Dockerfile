FROM 845742683201.dkr.ecr.ap-south-1.amazonaws.com/node:14.18.3-alpine3.14
RUN npm install pm2 -g
COPY . ./
RUN npm install
RUN apk add tzdata
ENV TZ="Asia/Kolkata"
CMD [ "pm2-runtime", "start", "ecosystem.config.js"]