# Marketing Azul

Plataforma para integrar o marketing no início dos projetos da companhia.
Monorepo com **backend** (NestJS + TypeORM + SQLite) e **frontend** (React + Vite).

Sem Docker, sem PostgreSQL, sem serviços externos — o banco é um arquivo SQLite
criado automaticamente. Roda direto no **GitHub Codespaces** ou na sua máquina.

---

## 🤖 Guia rápido para o agente de IA do Codespaces

> Esta seção é um roteiro **determinístico** para uma IA (ou qualquer pessoa) subir o
> projeto do zero. Rode os comandos **na ordem** e a partir da **raiz do repositório**.
> Não há passos interativos.

### Passo 0 — Garantir o pnpm (o gerenciador de pacotes)

O projeto usa **pnpm**. Se o comando `pnpm` não existir, habilite via corepack
(já vem com o Node) em vez de instalar globalmente:

```bash
corepack enable pnpm
corepack prepare pnpm@9 --activate
pnpm -v   # deve imprimir 9.x
```

### Passo 1 — Instalar as dependências (uma vez)

```bash
pnpm install
```

- O que esperar: ao final, `Done in ...`. O pacote `better-sqlite3` é compilado/baixado
  automaticamente (é permitido em `onlyBuiltDependencies` no `package.json` da raiz).
- Se aparecer aviso pedindo para aprovar build scripts, pode ignorar — os necessários
  já estão liberados.

### Passo 2 — Criar os usuários padrão no banco (uma vez)

```bash
pnpm seed
```

- Isso cria o arquivo SQLite (`apps/backend/marketing_azul.sqlite`), gera as tabelas e
  insere os usuários padrão.
- O que esperar no final:
  ```
  🎉 Seed concluído!
  📋 Credenciais de acesso:
     ADMIN:   admin@azul.com   / azul789
     ...
  ```
- Idempotente: rodar de novo apenas pula usuários que já existem.

### Passo 3 — Subir a aplicação (backend + frontend juntos)

⚠️ Este comando é **contínuo** (não retorna sozinho). Um agente de IA deve rodá-lo
em **background** ou em um **terminal dedicado**, e seguir trabalhando em outro terminal.

```bash
pnpm dev
```

- O que esperar:
  - Backend: `🚀 Marketing Azul API running on http://localhost:3000`
  - Frontend (Vite): `➜  Local:   http://localhost:5173/`
- Para parar: `Ctrl+C` no terminal onde ele roda.

### Passo 4 — Abrir no navegador

- **Local:** http://localhost:5173
- **Codespaces:** vá na aba **PORTS** do VS Code e abra a porta **5173** (o Codespaces
  encaminha automaticamente e mostra um link `https://<seu-codespace>-5173.app.github.dev`).
  **Basta a porta 5173** — não precisa expor a 3000 nem mexer em CORS (veja "Como as
  partes conversam" abaixo).

### Verificação rápida (opcional, sem abrir o navegador)

Com o `pnpm dev` rodando, teste o login pela API:

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@azul.com","password":"azul789"}'
```

Deve retornar um JSON com `user`, `accessToken` e `refreshToken`.

---

## Credenciais padrão (criadas pelo `pnpm seed`)

| Papel     | E-mail                   | Senha    |
|-----------|--------------------------|----------|
| Admin     | admin@azul.com           | azul789  |
| Analista  | analista@azul.com        | azul456  |
| Colaborador | trabalhador@azul.com   | azul123  |
| Colaborador | trabalhador2@azul.com  | azul123  |
| Colaborador | trabalhador3@azul.com  | azul123  |

---

## Como as partes conversam (por que só a porta 5173 basta)

- O **frontend** faz as chamadas de API para o caminho **relativo** `/api`.
- O dev server do **Vite** tem um **proxy**: tudo que chega em `/api/*` é encaminhado,
  internamente, para o **backend** em `http://localhost:3000` (removendo o prefixo `/api`).
- Como a chamada sai do próprio dev server (mesma origem), **não há CORS** e **não é
  preciso tornar a porta 3000 pública** no Codespaces. Só a **5173** precisa estar acessível.

---

## Banco de dados (SQLite)

- Arquivo local: `apps/backend/marketing_azul.sqlite`, criado no primeiro boot.
- As tabelas são geradas automaticamente pelo TypeORM (`synchronize: true`) a partir das
  entidades em `apps/backend/src/modules/**` — **não há migrations** para rodar.
- O arquivo `.sqlite` é ignorado pelo git (`.gitignore`).
- Para **zerar o banco**, apague o arquivo e rode o seed de novo:
  ```bash
  rm -f apps/backend/marketing_azul.sqlite && pnpm seed
  ```

---

## Variáveis de ambiente

O backend lê **`apps/backend/.env`** (já vem com valores prontos para desenvolvimento).
Nada precisa ser configurado para o app subir. Chaves relevantes:

| Variável              | Uso                                                        |
|-----------------------|------------------------------------------------------------|
| `PORT`                | Porta do backend (padrão `3000`)                           |
| `DATABASE_PATH`       | Caminho do arquivo SQLite (padrão `marketing_azul.sqlite`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Chaves de autenticação                       |
| `OPENAI_API_KEY`      | **Opcional** — só para as funcionalidades de IA            |

> As funcionalidades de IA (resumo, feedback) precisam de uma `OPENAI_API_KEY` válida.
> O restante do sistema (login, cadastro de projetos, usuários) funciona sem ela.

---

## Scripts úteis

| Comando       | O que faz                                          |
|---------------|----------------------------------------------------|
| `pnpm dev`    | Sobe backend e frontend em modo dev (contínuo)     |
| `pnpm seed`   | Cria os usuários padrão no banco                    |
| `pnpm build`  | Compila backend e frontend                          |
| `pnpm lint`   | Roda o lint                                         |

### Rodar só uma das partes

```bash
# só o backend
pnpm --filter @marketing-azul/backend run dev

# só o frontend
pnpm --filter @marketing-azul/frontend run dev
```

---

## Solução de problemas

| Sintoma                                             | Causa provável / solução                                                                 |
|-----------------------------------------------------|------------------------------------------------------------------------------------------|
| `command not found: pnpm`                           | Rode o **Passo 0** (`corepack enable pnpm`).                                              |
| Erro ao instalar `better-sqlite3`                   | Precisa de toolchain de build (Node 20+, `python3`, `make`, `g++`). O Codespaces já tem. |
| `EADDRINUSE` na porta 3000 ou 5173                  | Já existe algo rodando na porta. Feche o processo anterior ou mude `PORT` no `.env`.      |
| Tela branca no frontend                             | Confirme que o backend está de pé (`pnpm dev` mostra as duas partes) e recarregue.       |
| Login falha com "Credenciais inválidas"             | Rode `pnpm seed`. Se persistir, zere o banco (ver seção do banco) e rode o seed de novo. |
| IA (resumo/feedback) não funciona                   | Falta `OPENAI_API_KEY` em `apps/backend/.env`. O resto do app funciona sem ela.          |
| No Codespaces a página não abre                     | Abra a porta **5173** na aba **PORTS**. Não precisa expor a 3000.                         |

---

## Estrutura

```
apps/
  backend/    NestJS + TypeORM (SQLite)   — API em :3000
  frontend/   React + Vite                — UI em :5173 (proxy /api → backend)
package.json  scripts do monorepo (pnpm + turbo)
```
