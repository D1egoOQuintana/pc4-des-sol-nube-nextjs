FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package manifests first and install all dependencies (including dev)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build the Next.js app
COPY . .
# If a JS/ESM config exists prefer it: remove next.config.ts to avoid Next loading both
RUN if [ -f ./next.config.mjs ]; then echo "Found next.config.mjs - removing next.config.ts to avoid duplicate load" && rm -f ./next.config.ts; fi

# Build the Next.js app
RUN npm run build

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
