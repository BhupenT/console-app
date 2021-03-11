# Iconic Console APP Test

Challenge is to write a console application that consumes our product API and decorates results with video preview links (note that not all API results contain video previews). Products that contain video previews should also be preferenced to the top of the results in the final output of the script. Build your solution in either PHP or Typescript. You can use any framework you like however we prefer Symfony for PHP and NestJS for TypeScript. Your script should write the results to a file named out.json

## Features

### Under the hood it uses readable | transform | writable

#### It should handle large files

- Console application that gets the product from an api
- automatically sorts the products to top that has video previews
- also attaches the video previews into the product data after calling from the video api using its sku
- and finally outputs to a json file with the sorted and attached video datas in a pretty json format
- Can be used to sort by different field and attach a different field easily with the help of config "iconic-cli.json"
- powers by the iconic-cli.json

> This is my first time using nest js framework. So i did what i could do while learning. Its great framework.
> I enjoyed very much with its modular based provider controller system

## Installation

requires [Node.js](https://nodejs.org/) v10+ and [Nest.js](https://nestjs.com/) to run.

#### Development environment: Install the dependencies and devDependencies and start the server after Cloning this repo

```sh
npm ci && npm i -g # if you want to have the iconic-cli command available throughtout
# running dev mode
npm run start:dev # this is normal nest

# to export products
npm run console-app export-products

# or if you installed as npm -i g
iconic-cli export-products
```

For production environments...

```sh
npm install --production
NODE_ENV=production
npm run build && npm run start:prod # this is normal nest server

# to export products
npm run console-app export-products

# or if you installed as npm -i g
iconic-cli export-products
```

## Docker and Docker Compose if you prefer

This is a multi build docker build process. Requires docker-compose and docker both installed in your computer.

```sh
.env # docker and docker-compose
```

```sh
iconic-cli.json # used for export product settings
```

#### Building from Docker compose

make sure .env variables is set to as:

## For production

```sh
BUILD_TYPE=prod #use dev for dev build
CONSOLE_PORT=3000 #totally up to you
NODE_ENV=production #set development for development
BUILD_TARGET=prod #set build to target build image
```

#### docker-compose.yml by default its set to prod

```sh
docker-compose build
docker-compose up -d
docker-compose exec console-app /bin/sh # going inside the container
iconic-cli export-products
cat out.json
```

## For Development and Testing

#### set docker-compose.yml "command": npm run start:dev

```sh
BUILD_TYPE=dev
CONSOLE_PORT=3000 #totally up to you
NODE_ENV=development #set development for development
BUILD_TARGET=build #set build to target build image
```

```sh
docker-compose up -d
docker-compose exec console-app /bin/sh # going inside the container
iconic-cli export-products
cat out.json
npm run test:cov
# or
npm run test
```

## Stay in touch

- Author - [Bhupendra Tamang](https://github.com/BhupenT)
