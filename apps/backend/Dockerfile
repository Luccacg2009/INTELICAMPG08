FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 3000

# TypeORM (synchronize) cria as tabelas no boot; o seed popula usuários padrão.
# `|| true` evita derrubar o container se o seed já rodou (usuários já existem).
CMD ["sh", "-c", "pnpm db:seed || true; pnpm dev"]
