FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/build/client /app/temp_build

CMD ["sh", "-c", "rm -rf /app/dist/* && cp -r /app/temp_build/* /app/dist/ && tail -f /dev/null"]