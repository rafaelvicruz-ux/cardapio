# Cardápio + Lista de Compras com Usuários

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
