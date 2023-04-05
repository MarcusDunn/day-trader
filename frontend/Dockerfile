FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
