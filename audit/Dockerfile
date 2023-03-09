FROM node:16-alpine

# grpcurl for healthcheck
RUN apk add --no-cache openssl libssl1.1
RUN apk add grpcurl --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

EXPOSE 50051

CMD npx prisma db push && npm run dev