FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN rm .env.local
RUN npm install
RUN npm run build


# Run and expose the server on port 4000
EXPOSE 3000

# A command to start the server
CMD ["npm", "start"]