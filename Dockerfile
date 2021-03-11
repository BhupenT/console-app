FROM node:14-alpine as build

ENV NODE_ENV build
RUN mkdir -p /code

WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build \
    && npm i -g
# with -g installs iconic-cli shell commands

RUN chown -R node:node /code

# --- for production

FROM node:14-alpine as prod

ENV NODE_ENV production

RUN mkdir -p /code

WORKDIR /home/node

COPY --from=build /home/node/package*.json /home/node/

#  --- for iconic-cli configSettings -- as of now it doesnt auto creates 
# but can be easily added in the app if doesnt exist by asking questions

COPY --from=build /home/node/iconic*.json /home/node/

#  --- production serve only dist files
COPY --from=build /home/node/dist/ /home/node/dist/

RUN npm ci \
    && npm i -g
# with -g installs iconic-cli shell commands

RUN chown -R node:node /code

CMD ["sh","-c","npm run start:prod"]
