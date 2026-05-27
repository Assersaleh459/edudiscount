FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN mkdir -p /app/uploads
EXPOSE 3001
CMD ["node", "src/index.js"]
