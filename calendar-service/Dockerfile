# Base image
FROM 845742683201.dkr.ecr.ap-south-1.amazonaws.com/node:18.15.0-alpine as base

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install app dependencies
RUN npm install

# Execute test cases and stop build if fails
RUN npm run test || exit 1

# Creates a "dist" folder with the production build
RUN npm run build


# Prod-Ready Image
FROM 845742683201.dkr.ecr.ap-south-1.amazonaws.com/node:18.15.0-alpine as prod
RUN mkdir dist node_modules
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./

# Start the server using the production build
CMD [ "npm", "run", "start:prod" ]