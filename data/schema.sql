-- Estrutura do banco de dados para sistema de usuários + listas + cardápios

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  token TEXT NULL
);
