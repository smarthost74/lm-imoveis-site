import { createServer } from "node:http";
import next from "next";

/**
 * Servidor custom só porque o "Setup Node.js App" do cPanel (Passenger)
 * precisa de um arquivo de entrada que escute em `process.env.PORT` — não
 * existe uma forma de apontar o Passenger direto para `next start`. Fora
 * do cPanel (local, Vercel etc.) use `next dev`/`next start` normalmente,
 * este arquivo não entra no caminho.
 */
const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Servidor pronto em http://localhost:${port}`);
  });
});
