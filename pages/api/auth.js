import { findUserByEmail } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método não permitido' });
    return;
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    return;
  }

  const user = await findUserByEmail(email);
  if (!user || user.password !== password) {
    res.status(401).json({ message: 'Credenciais inválidas' });
    return;
  }

  res.status(200).json({ token: user.token, user: { id: user.id, name: user.name, email: user.email } });
}