FROM node:24-alpine AS builder

WORKDIR /app

# Map build-time ARGs to Runtime VITE_ env vars
ARG API_BASE_URL
ENV VITE_API_BASE_URL=${API_BASE_URL}

ARG WS_BASE_URL
ENV VITE_WS_BASE_URL=${WS_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/client /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]