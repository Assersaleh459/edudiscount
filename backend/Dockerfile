FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD sh -c "npx prisma generate && npx prisma migrate deploy && node prisma/seed.js && node src/index.js"
