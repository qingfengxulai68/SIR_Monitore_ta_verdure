FROM node:24-alpine AS builder

WORKDIR /app

# Map build-time ARGs to Runtime VITE_ env vars
ARG BACKEND_BASE_URL
ENV VITE_BACKEND_BASE_URL=${BACKEND_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
#RUN npm run build
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

FROM nginx:alpine-slim

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/client /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]