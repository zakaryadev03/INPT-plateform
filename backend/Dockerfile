FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire backend folder, including the .env file from the root
COPY . .
COPY ../.env .env

EXPOSE 5000

CMD ["npm", "run", "start"]
