# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Build-time env for API base URL (Vite needs VITE_ prefix to embed at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 1. Copy package definitions first
# This allows Docker to cache dependencies if package.json hasn't changed
COPY package.json package-lock.json ./

# 2. Install dependencies (Clean Install)
RUN npm ci

# 3. Copy the rest of the source code
# Note: files listed in .dockerignore (like .prettierrc) will be excluded
COPY . .

# 4. Build the application
# React Router v7 generates the output in 'build/client'
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION (Nginx)
# ==========================================
FROM nginx:alpine

# 1. Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy ONLY the built artifacts from the 'builder' stage
# We discard the node_modules and source code here to keep the image small
COPY --from=builder /app/build/client /usr/share/nginx/html

# 3. Expose port 80
EXPOSE 80

# 4. Start Nginx
CMD ["nginx", "-g", "daemon off;"]