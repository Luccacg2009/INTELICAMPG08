FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml* ./

COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/

RUN pnpm install --filter=@marketing-azul/backend --filter=@marketing-azul/backend...

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["npm", "run", "dev"]