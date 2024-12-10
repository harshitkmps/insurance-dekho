POS BFF (Backend For Frontend)

Setup:

    1. node version is specified in .nvmrc. Run the following commands to change node version:
        --nvm use
        --nvm install (if specified node version is not installed)
    2. to install redis on local machine:
        --sudo apt update
        --sudo apt install redis-server
        --sudo systemctl status redis-server
    3. swagger link : {host}/api-doc (ex : localhost:3000/api-doc)
    4. install the following extensions from vscode marketplace:
        prettier
        eslint

Available Commands for the Server:

    1.Run the Server in production mode : npm run start or Start typescript-express-starter in VS Code
    2.Run the Server in development mode : npm run dev or Dev typescript-express-starter in VS Code
    3.Run all unit-tests : npm test or Test typescript-express-starter in VS Code
    Check for linting errors : npm run lint or Lint typescript-express-starter in VS Code
    4. To run project on local system, following command can be used:
        --npm run dev
    5. additional commands related to project are added in package.json
    6.Fix for linting : npm run lint:fix or Lint:Fix typescript-express-starter in VS Code or npm run lint -- --fix

Important libraries used:

    1.npm package used : typescript-express-starter (https://www.npmjs.com/package/typescript-express-starter)
    2.npm package used for json transformations: node-json-transformer (https://github.com/bozzltron/node-json-transform)
    3.npm package used for dependency injection: typedi (https://github.com/typestack/typedi)


Important points:

    1. The intent of creating this application is to provide use case specific interface to the frontend(mobile/desktop devices)
       for enhanced user experience while hiding internal services/endpoints and not exposing unnecessary or sensitive data which is not needed by the frontend.
    2. For local development properties can be set as environment variables in .env.development file. For staging and production, the environment variables should be added directly to the remote server in files: .env.staging and .env.production respectively.
    3. For staging and production environments the application is deployed inside a docker conatiner.
    4. BFF is wrapped inside a global exception handler which will prevent application from crashing in case of an uncaught execption however if a thread/process gets caught in an exception after sending the response from the API then the applicaton will crash.
    Eg: async db opertions(logging) after sending response. if method that is writing to db after sending response crashes and is not caught then the application will crash.




