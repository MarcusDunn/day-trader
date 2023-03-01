FROM node:16-alpine

RUN apk add --no-cache openssl libssl1.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 50051

CMD ["npm", "run", "docker"]