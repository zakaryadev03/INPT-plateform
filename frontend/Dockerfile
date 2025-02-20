# Use Node.js to build the frontend
FROM node:18 AS build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Use an Nginx image to serve the frontend
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
