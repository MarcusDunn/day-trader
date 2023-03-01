FROM node:16-alpine

RUN apk add --no-cache openssl libssl1.1

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate
RUN npm run build


EXPOSE 50051

CMD ["npm", "run", "docker"]