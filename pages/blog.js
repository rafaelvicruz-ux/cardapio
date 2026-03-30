import { useEffect } from 'react';

export default function Blog() {
  useEffect(() => {
    // Define the abrircanal function
    window.abrircanal = () => {
      window.open('https://www.youtube.com/channel/UC...', '_blank'); // Replace with actual channel URL
    };
  }, []);

  return (
    <div>
      <h1>Blogzinho</h1>
      <button onClick={() => window.abrircanal()}>Abrir Canal</button>
    </div>
  );
}