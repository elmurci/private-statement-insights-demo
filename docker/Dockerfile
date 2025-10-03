FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY app/package.json app/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy application files to current directory (not ./app subdirectory)
COPY app/. ./

COPY start.sh ./

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8080

CMD ["./start.sh"]