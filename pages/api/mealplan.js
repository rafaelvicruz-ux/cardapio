import { findUserByToken, saveMealplan, getMealplans } from './db.js';

async function getUser(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ message: 'Token ausente' });
    return null;
  }

  const user = await findUserByToken(token);
  if (!user) {
    res.status(401).json({ message: 'Token inválido' });
    return null;
  }

  return user;
}

export default async function handler(req, res) {
  const user = await getUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const period = req.query.period || 'week';
    const list = await getMealplans(user.id, period);
    res.status(200).json(list);
    return;
  }

  if (req.method === 'POST') {
    const { recipe, period } = req.body || {};
    if (!recipe || !period) {
      res.status(400).json({ message: 'Receita e período são obrigatórios' });
      return;
    }
    const saved = await saveMealplan(user.id, recipe, period);
    res.status(201).json(saved);
    return;
  }

  res.status(405).json({ message: 'Método não permitido' });
}