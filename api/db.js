import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'data');
const dbFile = path.join(dbDir, 'db.json');

function initDB() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: [], groceries: [], mealplans: [] }, null, 2));
  }
}

function readDB() {
  initDB();
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email) {
  const db = readDB();
  return db.users.find(u => u.email === email);
}

export function findUserByToken(token) {
  const db = readDB();
  return db.users.find(u => u.token === token);
}

export function insertUser(user) {
  const db = readDB();
  db.users.push(user);
  writeDB(db);
  return user;
}

export function saveGrocery(userId, item, period) {
  const db = readDB();
  const id = Date.now();
  db.groceries.push({ id, userId, item, period, createdAt: new Date().toISOString() });
  writeDB(db);
  return { id, userId, item, period };
}

export function getGroceries(userId, period) {
  const db = readDB();
  return db.groceries.filter(i => i.userId === userId && i.period === period);
}

export function saveMealplan(userId, recipe, period) {
  const db = readDB();
  const id = Date.now();
  db.mealplans.push({ id, userId, recipe, period, createdAt: new Date().toISOString() });
  writeDB(db);
  return { id, userId, recipe, period };
}

export function getMealplans(userId, period) {
  const db = readDB();
  return db.mealplans.filter(i => i.userId === userId && i.period === period);
}
