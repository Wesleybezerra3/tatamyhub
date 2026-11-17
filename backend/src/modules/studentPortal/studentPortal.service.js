import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StudentPortalRepository } from './studentPortal.repository.js';

export class StudentPortalService {
  /**
   * Autenticação do aluno por telefone/email e senha
   */
  static async login({ identificador, senha }) {
    if (!identificador || !senha) {
      const error = new Error('Informe seu identificador (telefone ou e-mail) e sua senha.');
      error.status = 400;
      throw error;
    }

    const candidates = await StudentPortalRepository.findCandidatesByLogin(identificador);
    if (!candidates || candidates.length === 0) {
      const error = new Error('Aluno não encontrado com este telefone ou e-mail.');
      error.status = 401;
      throw error;
    }

    // Procura entre os registros correspondentes aquele cuja senha confere
    let student = null;
    let hasAnyWithPassword = false;

    for (const cand of candidates) {
      if (cand.senha_hash) {
        hasAnyWithPassword = true;
        const isValid = await bcrypt.compare(senha, cand.senha_hash);
        if (isValid) {
          student = cand;
          break;
        }
      }
    }

    if (!student) {
      if (!hasAnyWithPassword) {
        const error = new Error('Sua senha de acesso ainda não foi definida pelo gestor da academia. Solicite seu primeiro acesso.');
        error.status = 403;
        throw error;
      }
      const error = new Error('Identificador ou senha incorretos.');
      error.status = 401;
      throw error;
    }

    if (student.status === 'inativo') {
      const error = new Error('Acesso desativado. Entre em contato com a secretaria da academia.');
      error.status = 403;
      throw error;
    }

    // Atualiza último login
    await StudentPortalRepository.updateLastLogin(student.id);

    const secret = process.env.JWT_SECRET || 'tatamyhub_super_secret_jwt_key_2026_change_in_production';
    const payload = {
      id: student.id,
      aluno_id: student.id,
      academia_id: student.academia_id,
      role: 'aluno',
      nome: student.nome
    };

    const token = jwt.sign(payload, secret, { expiresIn: '15d' });

    return {
      token,
      aluno: {
        id: student.id,
        nome: student.nome,
        telefone: student.telefone,
        email: student.email,
        academia_id: student.academia_id,
        primeiro_acesso: Boolean(student.primeiro_acesso)
      },
      academia: {
        id: student.academia_id,
        nome: student.academia_nome,
        logo_url: student.academia_logo_url,
        whatsapp: student.academia_whatsapp
      }
    };
  }

  /**
   * Perfil do aluno autenticado
   */
  static async getMe(alunoId) {
    const student = await StudentPortalRepository.findById(alunoId);
    if (!student) {
      const error = new Error('Aluno não encontrado.');
      error.status = 404;
      throw error;
    }

    return {
      aluno: {
        id: student.id,
        nome: student.nome,
        telefone: student.telefone,
        email: student.email,
        data_nascimento: student.data_nascimento,
        data_matricula: student.data_matricula,
        primeiro_acesso: Boolean(student.primeiro_acesso)
      },
      academia: {
        id: student.academia_id,
        nome: student.academia_nome,
        logo_url: student.academia_logo_url,
        whatsapp: student.academia_whatsapp
      }
    };
  }

  /**
   * Aluno altera a própria senha
   */
  static async changePassword(alunoId, { senha_atual, nova_senha }) {
    if (!nova_senha || typeof nova_senha !== 'string' || nova_senha.length < 6) {
      const error = new Error('A nova senha deve ter no mínimo 6 caracteres.');
      error.status = 400;
      throw error;
    }

    const student = await StudentPortalRepository.findById(alunoId);
    if (!student) {
      const error = new Error('Aluno não encontrado.');
      error.status = 404;
      throw error;
    }

    // Se já tinha senha, valida a senha atual
    if (student.senha_hash) {
      if (!senha_atual) {
        const error = new Error('Informe sua senha atual para autorizar a troca.');
        error.status = 400;
        throw error;
      }
      const isValid = await bcrypt.compare(senha_atual, student.senha_hash);
      if (!isValid) {
        const error = new Error('Senha atual incorreta.');
        error.status = 401;
        throw error;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(nova_senha, salt);
    await StudentPortalRepository.updatePassword(alunoId, senhaHash);

    return { message: 'Senha atualizada com sucesso!' };
  }

  /**
   * Gestor define ou reseta a senha do aluno
   */
  static async setCredentialsByAdmin(academiaId, alunoId, { nova_senha }) {
    if (!nova_senha || typeof nova_senha !== 'string' || nova_senha.length < 6) {
      const error = new Error('A senha deve ter no mínimo 6 caracteres.');
      error.status = 400;
      throw error;
    }

    const student = await StudentPortalRepository.findById(alunoId);
    if (!student || student.academia_id !== academiaId) {
      const error = new Error('Aluno não encontrado nesta academia.');
      error.status = 404;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(nova_senha, salt);
    await StudentPortalRepository.updatePassword(alunoId, senhaHash);

    return { message: 'Senha de acesso do aluno definida com sucesso!' };
  }

  /**
   * Hub consolidado: graduação, faturas, resumo e alerta inteligente
   */
  static async getHubOverview(alunoId, academiaId) {
    const student = await StudentPortalRepository.findById(alunoId);
    if (!student) {
      const error = new Error('Aluno não encontrado.');
      error.status = 404;
      throw error;
    }

    // 1. Graduações
    const graduations = await StudentPortalRepository.getGraduations(alunoId, academiaId);

    // 2. Faturas
    const invoices = await StudentPortalRepository.getInvoices(alunoId, academiaId);

    // 3. Determina a Chave PIX padrão da academia
    const chavePix = student.chave_pix || student.academia_whatsapp || student.academia_email || student.academia_documento || 'Consulte a secretaria';

    // 4. Formata faturas recentes e apura o alerta financeiro
    const alertData = this.calculateFinancialAlert(invoices);

    const faturasAbertas = invoices.filter(inv => ['pendente', 'atrasada'].includes(inv.status));
    const totalPendente = faturasAbertas.reduce((acc, inv) => acc + (Number(inv.valor) - Number(inv.valor_pago || 0)), 0);

    return {
      aluno: {
        id: student.id,
        nome: student.nome,
        telefone: student.telefone,
        email: student.email,
        data_matricula: student.data_matricula,
        primeiro_acesso: Boolean(student.primeiro_acesso)
      },
      academia: {
        id: student.academia_id,
        nome: student.academia_nome,
        logo_url: student.academia_logo_url,
        whatsapp: student.academia_whatsapp,
        chave_pix: chavePix,
        tipo_chave_pix: student.tipo_chave_pix || null,
        beneficiario_pix: student.beneficiario_pix || student.academia_nome || null
      },
      graduacao_atual: graduations.atual,
      modalidades: graduations.modalidades,
      historico_graduacoes: graduations.historico,
      resumo_financeiro: {
        faturas_abertas_count: faturasAbertas.length,
        total_pendente: totalPendente,
        proxima_fatura: faturasAbertas.length > 0 ? faturasAbertas[0] : null
      },
      alerta: alertData,
      faturas_recentes: invoices.slice(0, 6)
    };
  }

  /**
   * Calcula o alerta financeiro para o Hub e Popup
   */
  static calculateFinancialAlert(invoices) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // 1. Procurar fatura atrasada (mais urgente primeiro)
    const atrasadas = invoices.filter(inv => {
      if (inv.status === 'atrasada') return true;
      if (inv.status === 'pendente') {
        const vDate = (inv.data_vencimento instanceof Date ? inv.data_vencimento.toISOString() : String(inv.data_vencimento)).split('T')[0];
        return vDate < todayStr;
      }
      return false;
    });

    if (atrasadas.length > 0) {
      const maisAntiga = atrasadas[0];
      const vDateStr = (maisAntiga.data_vencimento instanceof Date ? maisAntiga.data_vencimento.toISOString() : String(maisAntiga.data_vencimento)).split('T')[0];
      const vDate = new Date(vDateStr + 'T00:00:00');
      const diffTime = Math.abs(today - vDate);
      const diasAtraso = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const valorAberto = Number(maisAntiga.valor) - Number(maisAntiga.valor_pago || 0);

      return {
        tipo: 'atrasada',
        titulo: 'Mensalidade em Atraso',
        mensagem: `Você possui fatura vencida há ${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'}. Regularize para evitar juros e manter sua matrícula ativa.`,
        fatura_id: maisAntiga.id,
        valor: valorAberto,
        data_vencimento: vDateStr,
        competencia: maisAntiga.competencia,
        dias_atraso: diasAtraso,
        dias_para_vencer: 0,
        deve_exibir_popup: true
      };
    }

    // 2. Procurar fatura vencendo nos próximos 5 dias (ou vencendo hoje)
    const emVencimento = invoices.filter(inv => {
      if (inv.status !== 'pendente') return false;
      const vDateStr = (inv.data_vencimento instanceof Date ? inv.data_vencimento.toISOString() : String(inv.data_vencimento)).split('T')[0];
      const vDate = new Date(vDateStr + 'T00:00:00');
      const diffDays = Math.ceil((vDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 5;
    });

    if (emVencimento.length > 0) {
      const proxima = emVencimento[0];
      const vDateStr = (proxima.data_vencimento instanceof Date ? proxima.data_vencimento.toISOString() : String(proxima.data_vencimento)).split('T')[0];
      const vDate = new Date(vDateStr + 'T00:00:00');
      const diffDays = Math.ceil((vDate - today) / (1000 * 60 * 60 * 24));
      const valorAberto = Number(proxima.valor) - Number(proxima.valor_pago || 0);

      const diasTexto = diffDays === 0 ? 'vence hoje' : diffDays === 1 ? 'vence amanhã' : `vence em ${diffDays} dias`;

      return {
        tipo: 'atencao',
        titulo: 'Lembrete de Vencimento',
        mensagem: `Sua mensalidade de competência ${proxima.competencia} ${diasTexto}.`,
        fatura_id: proxima.id,
        valor: valorAberto,
        data_vencimento: vDateStr,
        competencia: proxima.competencia,
        dias_atraso: 0,
        dias_para_vencer: diffDays,
        deve_exibir_popup: true
      };
    }

    // 3. Tudo em dia
    return {
      tipo: 'regular',
      titulo: 'Tudo em Dia!',
      mensagem: 'Você não possui mensalidades pendentes no momento. Bons treinos!',
      deve_exibir_popup: false
    };
  }

  /**
   * Lista mensalidades do aluno
   */
  static async getInvoices(alunoId, academiaId, status = null) {
    return await StudentPortalRepository.getInvoices(alunoId, academiaId, status);
  }
}
