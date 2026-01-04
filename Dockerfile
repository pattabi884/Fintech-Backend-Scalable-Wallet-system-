FROM node:20-alpine

WORKDIR /app

# 1. Copy everything
COPY . .

# 2. Nuclear Clean (Ensure no Windows files remain)
RUN rm -rf node_modules dist

# 3. Install
RUN npm install

# 4. Generate
RUN npm run generate:all

# --- 🕵️ SPY SECTION START ---
# A. Check if the folder exists at all
RUN echo "=== 📂 SPY: Listing @prisma folder ===" && \
    ls -R node_modules/@prisma || echo "❌ @prisma folder missing"

# B. Check if central-client exists and list its contents
RUN echo "=== 📂 SPY: Listing central-client ===" && \
    ls -la node_modules/@prisma/central-client || echo "❌ central-client missing"

# C. Read the package.json to see how it defines itself
RUN echo "=== 📜 SPY: Reading package.json ===" && \
    cat node_modules/@prisma/central-client/package.json || echo "❌ package.json missing"
# --- 🕵️ SPY SECTION END ---

# 5. Build (This will fail, but we will see the logs above it)
RUN npx tsc --skipLibCheck

CMD ["node", "dist/src/app.js"]