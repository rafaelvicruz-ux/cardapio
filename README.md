# toq uma rede social 

Sistema com autenticação, cadastro de usuários, listas de compras semana/mês e cardápios semana/mês.

## Como testar localmente
1. Instale dependências (se precisar de comandos Node específicos):
   - `npm init -y`
   - `npm install` (não há dependências necessárias para os endpoints básicos; usa `fs` e módulos nativos)
2. Instale Vercel CLI: `npm i -g vercel`
3. Execute: `vercel dev`
4. Acesse: `http://localhost:3000`

## Endpoints API
- `POST /api/register` -> `{ name, email, password }`
- `POST /api/auth` -> `{ email, password }` (retorna `token`)
- `GET /api/user` -> `Authorization: Bearer <token>`
- `GET /api/grocery?period=week|month`
- `POST /api/grocery` -> `{ item, period }`
- `GET /api/mealplan?period=week|month`
- `POST /api/mealplan` -> `{ recipe, period }`

## Estrutura de banco de dados (dados em `data/db.json` no protótipo)
- `users`: id, name, email, password, token
- `groceries`: id, userId, item, period
- `mealplans`: id, userId, recipe, period

## SQL de esquema
- `data/schema.sql` (para migração em SQLite/SQL)

## Supabase (produção no Vercel/GitHub)
1. Crie um projeto Supabase.
2. Em `Tables`, crie:
   - `users`: `id` (int8, primary key), `name` text, `email` text unique, `password` text, `token` text
   - `groceries`: `id` serial, `user_id` int8 (fk users.id), `item` text, `period` text, `created_at` timestamptz default now()
   - `mealplans`: `id` serial, `user_id` int8 (fk users.id), `recipe` text, `period` text, `created_at` timestamptz default now()
3. No Vercel, configure variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_ANON_KEY` para testes)

## Como testar localmente
1. Instale dependências: `npm install`
2. `npm run dev`
3. Acesse `http://localhost:3000`

## Como implantar para Vercel
1. Conecte repositório no Vercel.
2. Configure env vars no dashboard (SUPABASE_*).
3. `vercel --prod`

## Arquivos
- `src/index.html`
- `src/style.css`
- `src/script.js`
- `api/db.js`
- `api/register.js`
- `api/auth.js`
- `api/user.js`
- `api/grocery.js`
- `api/mealplan.js`
- `data/db.json` (gerado automaticamente)
- `data/schema.sql`
- `vercel.json`
