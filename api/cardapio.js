export default function handler(req, res) {
  const menu = [
    { id: 1, nome: "Pizza Margherita", preco: "R$ 35,00" },
    { id: 2, nome: "Hambúrguer Artesanal", preco: "R$ 28,00" },
    { id: 3, nome: "Suco Natural", preco: "R$ 8,00" }
  ];
  res.status(200).json(menu);
}