FROM node:20-alpine AS builder

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the frontend (vite.config.js outputs to /app/build)
RUN npm run build

# ---- Production image ----
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
