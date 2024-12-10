# creating node base image
FROM 845742683201.dkr.ecr.ap-south-1.amazonaws.com/node:18.4.0-alpine

# copying packages meta data to image
COPY ./package.json ./
COPY ./package-lock.json ./

# installing packages and dependencies
RUN npm ci --omit=dev --verbose && npm install typescript@4.9.5 -g

# copying source files to image
COPY ./app ./app
COPY ./tests ./tests
COPY ./index.ts ./tsconfig.json ./jest.config.ts ./

# execute test cases and exit if fails
RUN npm test || exit 1

# removing jest testing files to reduce image size
RUN rm -r ./tests && rm -r ./coverage && rm -r ./jest.config.ts

# compiling typescript to javascript
RUN tsc --build

# removing source files to reduce image size
RUN rm -r ./app

# move all generated files to root directory.
RUN mv -v ./dist/app ./ && mv -v ./dist/index.js ./

# removing dist folder and its contents
RUN rm -r ./dist index.ts

# exposing port to public
EXPOSE 1337

# run the server
CMD ["npm", "start"]