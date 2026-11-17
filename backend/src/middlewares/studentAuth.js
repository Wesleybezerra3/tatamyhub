import jwt from 'jsonwebtoken';

export function authenticateStudentJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de acesso do aluno não fornecido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido. Esperado: Bearer <token>' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'tatamyhub_super_secret_jwt_key_2026_change_in_production';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Sessão do aluno expirada ou inválida. Faça login novamente.' });
    }

    if (decoded.role !== 'aluno') {
      return res.status(403).json({ error: 'Acesso negado: credencial não autorizada para o Portal do Aluno.' });
    }

    req.student = decoded;
    next();
  });
}
