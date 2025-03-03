FROM node:23-alpine3.20 AS builder

WORKDIR /usr/src/app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./
RUN npm run build

FROM node:23-alpine3.20 AS finale

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY backend/ ./backend/

COPY --from=builder /usr/src/app/frontend/dist ./frontend/dist

COPY .env .env-sample ./

ENTRYPOINT [ "npm", "start" ]