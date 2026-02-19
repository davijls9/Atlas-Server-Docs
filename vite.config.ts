import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'atlas-terminal-log',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/__atlas_log' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            try {
              const { message } = JSON.parse(body);
              console.log(message); // Prints to Node Terminal
              res.statusCode = 200;
              res.end('OK');
            } catch (e) {
              res.statusCode = 400;
              res.end('Error');
            }
            return;
          }
          next();
        });
      }
    }
  ],
})
