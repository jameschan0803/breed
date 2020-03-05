# *******  Backend setting up ***********

# important

#I think it is easy to start with scaffold instead of from a scratch, so I did some search and got this from Github(https://github.com/javieraviles/node-typescript-koa-rest) , which is not initially created by me!!!!!##

#reference site :  
```
https://jsonschema.net/#/
https://medium.com/velotio-perspectives/api-testing-using-postman-and-newman-6c68c33303fc
https://buddy.works/guides/how-dockerize-node-application
```

# Pre-reqs

```
Docker
NPM > 12.0.0
POSTMAN
```

# Getting Started
- Clone the repository
```
git clone --depth=1 https://github.com/jameschan0803/breed.git <project_name>
```
- Install dependencies
```
cd <project_name>
npm install
```
- Run the project directly in TS (port:43000)
```
npm run start 
npm run build

```
- test link : http://localhost:43000/dog-api/view/hound/afghan , it should return json data

- Run integration test (the test script is ran based on 43000), the test script in under integrationtests folder
- the test is use Postman (newman) to proceed.
```
npm run test:integration
```

# ******* Docker ***********

- build the docker image and create the container locally ( access local port: 43000, it  includes back-end only ).docker file is under back-end folder : DockerFile
```
docker build -t jameschan0803/apps .

docker run -p 43000:43000 jameschan0803/apps

```
- access sample : http://localhost:43000/dog-api

- or download Docker image from docker hub and Run
```
docker run jameschan0803/apps:latest

```
- if downloaded from docker hub, please stop running, and expose the port 43000 (excute below cmd)
```
docker run -p 43000:43000 jameschan0803/apps

```



# ********* Frontend setting up  *************

- Clone the repository
```
git clone --depth=1 https://github.com/jameschan0803/my-app.git <project_name>
```
- Install dependencies
```
cd <project_name>
npm install
```

- run the project  (default port : 3000)
```
npm run start
```

- Build the project 
```
npm run build
```

- Run cypress integration test, only when the backend/frontend are running, the test will pass 
-  4 test cases are located in cypress/integration/my-app-test : E2E test.js (the test script is ran based on 3000)
```
npm run cypress:open
```

