import { findUserByEmail, insertUser } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Método não permitido' });
    return;
  }

  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Dados incompletos' });
    return;
  }

  if (await findUserByEmail(email)) {
    res.status(400).json({ message: 'E-mail já cadastrado' });
    return;
  }

  const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
  const newUser = { id: Date.now(), name, email, password, token };
  await insertUser(newUser);

  res.status(201).json({ message: 'Usuário criado', id: newUser.id });
}