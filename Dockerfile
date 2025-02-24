FROM node:21-alpine3.18

USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./package.json ./
RUN npm install
COPY --chown=node:node ./ ./
EXPOSE 3000

CMD ["npm", "run","start"]  