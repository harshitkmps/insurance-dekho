Spartacus
-------------------------

Author - Ankit Shukla

------------------------------------------------------------------------------------------------------------

Steps to run :
    1.  setting up .env file or take it from someone - db, config, etc.
    2.  install node version : 18.4.0 or 
        -> run two node vesions using command 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash'.
        -> nvm --version : to check version.
        -> nvm install 18.4.0 : to install node version 18.4.0.
        -> nvm alias default 18.4.0 : to make 18.4.0 default version.
    3.  npm i : installing packages.
    4.  npm run start-dev : *used only for experimentation and development purposes, **warning not use this on prod.

Dev Env     -   npm run start-dev

Prod Env    -   Docker build    : npm run build
                Docker run      : npm run deploy

------------------------------------------------------------------------------------------------------------