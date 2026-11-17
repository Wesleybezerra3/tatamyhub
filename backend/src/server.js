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

// CORS robusto para produção (Vercel), desenvolvimento e mobile
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');

  // Responde imediatamente a qualquer requisição preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

const configuredOrigin = process.env.CORS_ORIGIN;

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.options('*', cors());

// Health check para monitorar se a API está ativa no Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

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
