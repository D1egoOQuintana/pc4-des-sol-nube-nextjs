FROM node:20-bullseye AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN apt-get update && apt-get install -y build-essential python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm ci --omit=dev

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/app ./app
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
