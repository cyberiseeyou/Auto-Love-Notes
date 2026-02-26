FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY . .

# Create data and photos directories
RUN mkdir -p data photos

EXPOSE 3000

CMD ["node", "src/index.js"]
