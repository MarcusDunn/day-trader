FROM node:16-alpine

RUN apk add --no-cache openssl libssl1.1

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

EXPOSE 50051

CMD npx prisma db push && npm run dev