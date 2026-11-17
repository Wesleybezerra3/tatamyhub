import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Esperado: Bearer <token>' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'tatamyhub_super_secret_jwt_key_2026_change_in_production';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
    }

    if (decoded.role === 'aluno') {
      return res.status(403).json({ error: 'Acesso restrito a administradores da academia.' });
    }

    req.user = decoded;
    next();
  });
}
