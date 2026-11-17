import pool from '../../config/database.js';

export class DashboardRepository {
  static async getMetrics(academiaId = 1) {
    // 1. Contagem de Modalidades Ativas
    const [modRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM modalidades WHERE academia_id = ? AND status = 'ativa'",
      [academiaId]
    );
    const modalidadesAtivas = modRows[0]?.total || 0;

    // 2. Contagem de Alunos Ativos (com verificação se a tabela 'alunos' já existe)
    let alunosAtivos = 0;
    try {
      const [tableExists] = await pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'alunos'"
      );
      if (tableExists.length > 0) {
        const [alunoRows] = await pool.query(
          "SELECT COUNT(*) AS total FROM alunos WHERE academia_id = ? AND status = 'ativo'",
          [academiaId]
        );
        alunosAtivos = alunoRows[0]?.total || 0;
      }
    } catch (err) {
      console.warn('[DashboardRepository] Tabela alunos ainda não criada:', err.message);
    }

    // 3. Mensalidades Atrasadas (qtd e valor somado)
    let mensalidadesAtrasadasQtd = 0;
    let mensalidadesAtrasadasValor = 0;
    try {
      const [tableExists] = await pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'mensalidades'"
      );
      if (tableExists.length > 0) {
        // Atualiza status para 'atrasada' se venceu
        await pool.query(
          "UPDATE mensalidades SET status = 'atrasada' WHERE academia_id = ? AND status = 'pendente' AND data_vencimento < CURDATE()",
          [academiaId]
        );

        const [mensalidadeRows] = await pool.query(
          `SELECT COUNT(*) AS total_qtd, COALESCE(SUM(valor - valor_pago), 0) AS total_valor
           FROM mensalidades
           WHERE academia_id = ? AND status = 'atrasada'`,
          [academiaId]
        );
        mensalidadesAtrasadasQtd = mensalidadeRows[0]?.total_qtd || 0;
        mensalidadesAtrasadasValor = parseFloat(mensalidadeRows[0]?.total_valor || 0);
      }
    } catch (err) {
      console.warn('[DashboardRepository] Tabela mensalidades ainda não criada:', err.message);
    }

    // 4. Total Arrecadado no Mês Corrente
    let arrecadadoMesValor = 0;
    try {
      const [tableExists] = await pool.query(
        "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'pagamentos'"
      );
      if (tableExists.length > 0) {
        const [pagamentoRows] = await pool.query(
          `SELECT COALESCE(SUM(valor), 0) AS total
           FROM pagamentos
           WHERE academia_id = ? AND MONTH(data_pagamento) = MONTH(CURDATE()) AND YEAR(data_pagamento) = YEAR(CURDATE())`,
          [academiaId]
        );
        arrecadadoMesValor = parseFloat(pagamentoRows[0]?.total || 0);
      }
    } catch (err) {
      console.warn('[DashboardRepository] Tabela pagamentos ainda não criada:', err.message);
    }

    // 5. Alertas Prioritários
    const alertas = [];
    if (modalidadesAtivas === 0) {
      alertas.push({
        id: 'alt-mod',
        tipo: 'onboarding',
        mensagem: 'Cadastre as modalidades da sua academia (ex: Jiu-Jitsu) para iniciar.',
        acao_url: '/configuracoes/modalidades'
      });
    }

    if (mensalidadesAtrasadasQtd > 0) {
      alertas.push({
        id: 'alt-atr',
        tipo: 'atraso',
        mensagem: `${mensalidadesAtrasadasQtd} mensalidade(s) em atraso aguardando contato via WhatsApp.`,
        acao_url: '/mensalidades'
      });
    }

    return {
      alunos_ativos: alunosAtivos,
      mensalidades_atrasadas_qtd: mensalidadesAtrasadasQtd,
      mensalidades_atrasadas_valor: mensalidadesAtrasadasValor,
      arrecadado_mes_valor: arrecadadoMesValor,
      modalidades_ativas_qtd: modalidadesAtivas,
      alertas
    };
  }
}
