FROM node:15-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN yarn install -g

COPY --chown=node:node . .

RUN chmod -R 777 /home/node/app

EXPOSE 3000

EXPOSE 3001

CMD [ "yarn", "start" ]
