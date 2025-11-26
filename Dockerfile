FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package manifests first and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build the Next.js app
COPY . .
# Ensure TypeScript and ts-node are available so next can load next.config.ts
RUN npm install --no-audit --no-fund --save-dev typescript ts-node && \
	NODE_OPTIONS='-r ts-node/register' npm run build

# ----------------------------
# ► RUNNER (Producción)
# ----------------------------
FROM node:20-bullseye-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy only runtime artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy next.config.ts to ensure Next can reference it if needed
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "start"]
