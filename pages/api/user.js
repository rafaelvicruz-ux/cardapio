import { findUserByToken } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Método não permitido' });
    return;
  }

  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ message: 'Token ausente' });
    return;
  }

  const user = await findUserByToken(token);
  if (!user) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }

  res.status(200).json({ id: user.id, name: user.name, email: user.email });
}