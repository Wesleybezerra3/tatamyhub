import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository.js';
import { AcademiaRepository } from '../academia/academia.repository.js';
import { AcademiaService } from '../academia/academia.service.js';

export class AuthService {
  static async register({ nome, email, senha, nome_academia, whatsapp, modalidade_inicial }) {
    // 1. Validação de dados do gestor
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
      const error = new Error('Informe seu nome completo (mínimo 2 caracteres).');
      error.status = 400;
      throw error;
    }

    if (!email || typeof email !== 'string') {
      const error = new Error('Informe um e-mail válido.');
      error.status = 400;
      throw error;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      const error = new Error('Formato de e-mail inválido.');
      error.status = 400;
      throw error;
    }

    if (!senha || typeof senha !== 'string' || senha.length < 6) {
      const error = new Error('A senha deve conter no mínimo 6 caracteres.');
      error.status = 400;
      throw error;
    }

    // 2. Validação dos dados da academia
    if (!nome_academia || typeof nome_academia !== 'string' || nome_academia.trim().length < 2) {
      const error = new Error('Informe o nome da sua academia (mínimo 2 caracteres).');
      error.status = 400;
      throw error;
    }

    // 3. Verificar duplicidade de e-mail
    const existing = await AuthRepository.findByEmail(cleanEmail);
    if (existing) {
      const error = new Error('Este e-mail já está cadastrado no sistema. Faça login ou use outro.');
      error.status = 400;
      throw error;
    }

    // 4. Hash da senha com bcryptjs
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 5. Executar onboarding atômico
    const result = await AuthRepository.registerOnboarding({
      nome: nome.trim(),
      email: cleanEmail,
      senha_hash: senhaHash,
      nome_academia: nome_academia.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : null,
      modalidade_inicial: modalidade_inicial ? modalidade_inicial.trim() : 'Jiu-Jitsu'
    });

    return {
      message: 'Conta e academia criadas com sucesso! Faça login para acessar o painel.',
      email: result.email
    };
  }

  static async login({ email, senha }) {
    if (!email || !senha) {
      const error = new Error('Informe seu e-mail e senha.');
      error.status = 400;
      throw error;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await AuthRepository.findByEmail(cleanEmail);

    if (!user) {
      const error = new Error('E-mail ou senha incorretos.');
      error.status = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!isValidPassword) {
      const error = new Error('E-mail ou senha incorretos.');
      error.status = 401;
      throw error;
    }

    const secret = process.env.JWT_SECRET || 'tatamyhub_super_secret_jwt_key_2026_change_in_production';
    const payload = {
      id: user.id,
      academia_id: user.academia_id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    const academia = await AcademiaRepository.getProfile(user.academia_id);

    return {
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        academia_id: user.academia_id
      },
      academia: academia ? {
        id: academia.id,
        nome: academia.nome,
        logo_url: academia.logo_url
      } : null
    };
  }

  static async getMe(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuário não encontrado.');
      error.status = 404;
      throw error;
    }

    return {
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        academia_id: user.academia_id
      },
      academia: {
        id: user.academia_id,
        nome: user.academia_nome,
        logo_url: user.academia_logo_url
      }
    };
  }

  static async deleteAccount(userId, { senha }) {
    if (!senha) {
      const error = new Error('Informe sua senha para confirmar a exclusão da conta.');
      error.status = 400;
      throw error;
    }

    const rawUser = await AuthRepository.findRawUserById(userId);
    if (!rawUser) {
      const error = new Error('Usuário não encontrado.');
      error.status = 404;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(senha, rawUser.senha_hash);
    if (!isValidPassword) {
      const error = new Error('Senha incorreta. Não foi possível confirmar a exclusão.');
      error.status = 401;
      throw error;
    }

    const userWithAcademia = await AuthRepository.findById(userId);
    if (userWithAcademia && userWithAcademia.academia_logo_url) {
      AcademiaService.deletePhysicalLogo(userWithAcademia.academia_logo_url);
    }

    // Excluir a academia, que cascateia e remove usuários, modalidades, alunos, mensalidades e pagamentos
    await AuthRepository.deleteAccount(rawUser.academia_id);

    return {
      message: 'Conta, academia e todos os dados vinculados foram permanentemente excluídos.'
    };
  }
}
