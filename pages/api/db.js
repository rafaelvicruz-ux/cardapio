import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const dbDir = path.join(process.cwd(), 'data');
const dbFile = path.join(dbDir, 'db.json');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabase = useSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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

export async function findUserByEmail(email) {
  if (useSupabase) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const db = readDB();
  return db.users.find(u => u.email === email) || null;
}

export async function findUserByToken(token) {
  if (useSupabase) {
    const { data, error } = await supabase.from('users').select('*').eq('token', token).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  const db = readDB();
  return db.users.find(u => u.token === token) || null;
}

export async function insertUser(user) {
  if (useSupabase) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  const db = readDB();
  db.users.push(user);
  writeDB(db);
  return user;
}

export async function saveGrocery(userId, item, period) {
  if (useSupabase) {
    const { data, error } = await supabase.from('groceries').insert({ user_id: userId, item, period }).select().single();
    if (error) throw error;
    return data;
  }

  const db = readDB();
  const id = Date.now();
  const newItem = { id, userId, item, period, createdAt: new Date().toISOString() };
  db.groceries.push(newItem);
  writeDB(db);
  return newItem;
}

export async function getGroceries(userId, period) {
  if (useSupabase) {
    const { data, error } = await supabase.from('groceries').select('*').eq('user_id', userId).eq('period', period);
    if (error) throw error;
    return data;
  }

  const db = readDB();
  return db.groceries.filter(i => i.userId === userId && i.period === period);
}

export async function saveMealplan(userId, recipe, period) {
  if (useSupabase) {
    const { data, error } = await supabase.from('mealplans').insert({ user_id: userId, recipe, period }).select().single();
    if (error) throw error;
    return data;
  }

  const db = readDB();
  const id = Date.now();
  const newItem = { id, userId, recipe, period, createdAt: new Date().toISOString() };
  db.mealplans.push(newItem);
  writeDB(db);
  return newItem;
}

export async function getMealplans(userId, period) {
  if (useSupabase) {
    const { data, error } = await supabase.from('mealplans').select('*').eq('user_id', userId).eq('period', period);
    if (error) throw error;
    return data;
  }

  const db = readDB();
  return db.mealplans.filter(i => i.userId === userId && i.period === period);
}
