import { findUserByToken, saveMealplan, getMealplans } from './db.js';

function getUser(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ message: 'Token ausente' });
    return null;
  }

  const user = findUserByToken(token);
  if (!user) {
    res.status(401).json({ message: 'Token inválido' });
    return null;
  }

  return user;
}

export default function handler(req, res) {
  const user = getUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const period = req.query.period || 'week';
    const list = getMealplans(user.id, period);
    res.status(200).json(list);
    return;
  }

  if (req.method === 'POST') {
    const { recipe, period } = req.body || {};
    if (!recipe || !period) {
      res.status(400).json({ message: 'Receita e período são obrigatórios' });
      return;
    }
    const saved = saveMealplan(user.id, recipe, period);
    res.status(201).json(saved);
    return;
  }

  res.status(405).json({ message: 'Método não permitido' });
}