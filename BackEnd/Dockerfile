# Debian-based image (glibc) required by onnxruntime-node native library (Alpine/musl fails to load it)
FROM node:20-bookworm-slim

WORKDIR /app

# Install app dependencies (from root package.json / package-lock.json)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY BackEnd/ ./

EXPOSE 5000

CMD ["node", "server.js"]
