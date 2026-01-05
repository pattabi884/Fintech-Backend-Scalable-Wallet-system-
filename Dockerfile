# Use Standard Node (Debian)
FROM node:18

WORKDIR /app

# 1. Install Dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# 2. Copy Source Code
COPY . .

# 3. Generate Prisma Clients
# We use ENV variables to ensure the schema validates correctly during build.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV SHARD_0_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV SHARD_1_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Force removal of any rogue .env file and run generation
RUN rm -f .env && npm run prisma:generate:all

# 4. Build TypeScript
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/src/app.js"]