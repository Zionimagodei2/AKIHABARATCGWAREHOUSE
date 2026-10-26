# Akihabara TCG Warehouse — static export served by nginx
# Build: Next.js static export -> ./out ; Serve: nginx:alpine
FROM node:22-alpine AS build
RUN apk add --no-cache bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build:static

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
