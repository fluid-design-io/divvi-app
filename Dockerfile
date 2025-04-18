# 🐋 Use a small Node base
FROM node:22-alpine

WORKDIR /app

# Copy lockfiles first for caching
COPY package.json package-lock.json* yarn.lock* ./

# Install deps
RUN npm ci

# Bring in your source and expo config
COPY . .

# Run the expo export step
RUN npm run build:web

# Expose the port Coolify will use
EXPOSE 3000

# Start your Express wrapper
CMD ["npm", "run", "start:server"]