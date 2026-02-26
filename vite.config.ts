import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'atlas-persistence-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // 1. GET /api/persist/:key - Retrieval
          if (req.url?.startsWith('/api/persist/') && req.method === 'GET') {
            const key = req.url.replace('/api/persist/', '');
            if (key === 'all') {
              const { PersistenceManager } = await import('./server/persistenceManager');
              const keys = await PersistenceManager.listKeys();
              const allData: Record<string, string> = {};
              for (const k of keys) {
                allData[k] = await PersistenceManager.read(k) || '';
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(allData));
              return;
            }

            const { PersistenceManager } = await import('./server/persistenceManager');
            const data = await PersistenceManager.read(key);
            if (data) {
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } else {
              res.statusCode = 404;
              res.end('Not Found');
            }
            return;
          }

          // 2. POST /api/persist/:key - Storage
          if (req.url?.startsWith('/api/persist/') && req.method === 'POST') {
            const key = req.url.replace('/api/persist/', '');
            let body = '';
            for await (const chunk of req) body += chunk;

            try {
              const { PersistenceManager } = await import('./server/persistenceManager');
              const success = await PersistenceManager.write(key, body);
              res.statusCode = success ? 200 : 500;
              res.end(success ? 'OK' : 'Error');
            } catch {
              res.statusCode = 400;
              res.end('Invalid Payload');
            }
            return;
          }

          // Legacy Terminal Log
          if (req.url === '/__atlas_log' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) body += chunk;
            try {
              const { message } = JSON.parse(body);
              console.log(message);
              res.statusCode = 200;
              res.end('OK');
            } catch {
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
