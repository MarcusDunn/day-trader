FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# COPY
COPY . .
COPY .env.local .env.local

RUN npm install


# Run and expose the server on port 4000
EXPOSE 3000

# A command to start the server
CMD ["npm", "run", "dev"]