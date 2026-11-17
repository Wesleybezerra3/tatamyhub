import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS flexível para desenvolvimento e acesso via rede local / mobile
const configuredOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas locais / sem header origin (curl, mobile webview, postman)
    if (!origin) return callback(null, true);

    // Se estiver explicitamente definido como '*' ou '0.0.0.0'
    if (!configuredOrigin || configuredOrigin === '*' || configuredOrigin.includes('0.0.0.0')) {
      return callback(null, true);
    }

    const allowed = configuredOrigin.split(',').map(o => o.trim());
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // Permite qualquer acesso local (localhost, 127.0.0.1, 192.168.*, 172.*, 10.*)
    const isLocalOrLAN = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (isLocalOrLAN) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de uploads estáticos (logos)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Rotas da API
app.use('/api', routes);

// Middleware centralizado de tratamento de erros
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TatamyHub API] Servidor rodando com sucesso em http://localhost:${PORT}`);
});

export default app;
