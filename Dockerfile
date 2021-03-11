FROM node:14-alpine as build

ENV NODE_ENV build
RUN mkdir -p /code

WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build

RUN chown -R node:node /code

# --- for production

FROM node:14-alpine as prod

ENV NODE_ENV production

RUN mkdir -p /code

WORKDIR /home/node

COPY --from=build /home/node/package*.json /home/node/
COPY --from=build /home/node/dist/ /home/node/dist/

RUN npm ci

RUN chown -R node:node /code

CMD ["sh","-c","npm run start:prod"]
