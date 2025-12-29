FROM node:22-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
