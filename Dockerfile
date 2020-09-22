FROM node:14-alpine AS backend-builder

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python python3 

WORKDIR /app
COPY ./backend/ /app

RUN npm i --unsafe-perms
RUN npm run build

RUN rm -rf node_modules && npm i --production

# ---

FROM node:14-alpine AS frontend-builder

WORKDIR /app
COPY ./frontend/ /app

RUN npm i --unsafe-perms
RUN npm run build

# ---

FROM node:14-alpine

WORKDIR /app
COPY --from=backend-builder /app/build/ build/
COPY --from=backend-builder /app/node_modules/ node_modules/
COPY --from=backend-builder /app/package.json package.json

COPY --from=frontend-builder /app/dist/ public/
COPY ./CHANGELOG public/changelog.txt

RUN mkdir -p /app/data

ENV PORT=8080

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]