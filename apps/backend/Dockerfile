FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml* ./

COPY package.json ./
COPY tsconfig.json ./

RUN pnpm install

COPY . .

RUN pnpm prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]