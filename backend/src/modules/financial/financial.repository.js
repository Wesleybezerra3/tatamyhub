import pool from '../../config/database.js';

export class FinancialRepository {
  /**
   * Atualiza status de faturas vencidas que ainda estão como pendentes
   */
  static async updateOverdueInvoices(academiaId) {
    try {
      await pool.query(
        `UPDATE mensalidades 
         SET status = 'atrasada' 
         WHERE academia_id = ? 
           AND status = 'pendente' 
           AND data_vencimento < CURDATE() 
           AND valor_pago < valor`,
        [academiaId]
      );
    } catch (err) {
      console.warn('[FinancialRepository] Falha ao atualizar faturas vencidas:', err.message);
    }
  }

  /**
   * Lista mensalidades com filtros
   */
  static async list(academiaId, { status, competencia, search, aluno_id } = {}) {
    await this.updateOverdueInvoices(academiaId);

    let query = `
      SELECT 
        m.id,
        m.academia_id,
        m.aluno_id,
        CAST(m.valor AS DOUBLE) AS valor,
        CAST(m.valor_pago AS DOUBLE) AS valor_pago,
        CAST((m.valor - m.valor_pago) AS DOUBLE) AS saldo_devedor,
        m.data_vencimento,
        m.competencia,
        m.status,
        m.observacoes,
        m.created_at,
        a.nome AS aluno_nome,
        a.telefone AS aluno_telefone,
        am.faixa_atual AS aluno_faixa,
        am.graus_atual AS aluno_graus,
        mdl.nome AS modalidade_nome
      FROM mensalidades m
      JOIN alunos a ON m.aluno_id = a.id
      LEFT JOIN aluno_modalidades am ON a.id = am.aluno_id
      LEFT JOIN modalidades mdl ON am.modalidade_id = mdl.id
      WHERE m.academia_id = ?
    `;

    const params = [academiaId];

    if (aluno_id) {
      query += ' AND m.aluno_id = ?';
      params.push(parseInt(aluno_id, 10));
    }

    if (status && status !== 'todas') {
      query += ' AND m.status = ?';
      params.push(status);
    }

    if (competencia && competencia.trim()) {
      query += ' AND m.competencia = ?';
      params.push(competencia.trim());
    }

    if (search && search.trim()) {
      query += ' AND a.nome LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    query += `
      ORDER BY 
        CASE 
          WHEN m.status = 'atrasada' THEN 1 
          WHEN m.status = 'pendente' THEN 2 
          WHEN m.status = 'paga' THEN 3 
          ELSE 4 
        END ASC, 
        m.data_vencimento ASC, 
        a.nome ASC
    `;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Obtém detalhes de uma mensalidade e seus pagamentos
   */
  static async findById(academiaId, mensalidadeId) {
    await this.updateOverdueInvoices(academiaId);

    const [rows] = await pool.query(
      `SELECT 
        m.id,
        m.academia_id,
        m.aluno_id,
        CAST(m.valor AS DOUBLE) AS valor,
        CAST(m.valor_pago AS DOUBLE) AS valor_pago,
        CAST((m.valor - m.valor_pago) AS DOUBLE) AS saldo_devedor,
        m.data_vencimento,
        m.competencia,
        m.status,
        m.observacoes,
        m.created_at,
        a.nome AS aluno_nome,
        a.telefone AS aluno_telefone,
        ac.nome AS academia_nome,
        COALESCE(ac.chave_pix, ac.documento, ac.whatsapp, ac.email) AS academia_pix,
        ac.chave_pix,
        ac.tipo_chave_pix,
        ac.beneficiario_pix,
        ac.msg_cobranca_pendente,
        ac.msg_cobranca_atrasada
      FROM mensalidades m
      JOIN alunos a ON m.aluno_id = a.id
      JOIN academias ac ON m.academia_id = ac.id
      WHERE m.id = ? AND m.academia_id = ?`,
      [mensalidadeId, academiaId]
    );

    if (rows.length === 0) return null;
    const mensalidade = rows[0];

    const [pagamentos] = await pool.query(
      `SELECT 
        p.id,
        CAST(p.valor AS DOUBLE) AS valor,
        p.forma_pagamento,
        p.data_pagamento,
        p.observacao,
        p.created_at,
        u.nome AS usuario_nome
      FROM pagamentos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.mensalidade_id = ? AND p.academia_id = ?
      ORDER BY p.data_pagamento DESC, p.id DESC`,
      [mensalidadeId, academiaId]
    );

    return {
      ...mensalidade,
      pagamentos
    };
  }

  /**
   * Criação de mensalidade avulsa
   */
  static async create(academiaId, invoiceData) {
    const { aluno_id, valor, data_vencimento, competencia, observacoes } = invoiceData;

    // Verificar se já existe fatura para o aluno nesta competência
    const [existing] = await pool.query(
      'SELECT id FROM mensalidades WHERE academia_id = ? AND aluno_id = ? AND competencia = ?',
      [academiaId, aluno_id, competencia]
    );

    if (existing.length > 0) {
      throw new Error(`O aluno já possui mensalidade cadastrada para a competência ${competencia}.`);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const initialStatus = data_vencimento < todayStr ? 'atrasada' : 'pendente';

    const [result] = await pool.query(
      `INSERT INTO mensalidades (academia_id, aluno_id, valor, valor_pago, data_vencimento, competencia, status, observacoes)
       VALUES (?, ?, ?, 0.00, ?, ?, ?, ?)`,
      [academiaId, aluno_id, valor, data_vencimento, competencia, initialStatus, observacoes || null]
    );

    return result.insertId;
  }

  /**
   * Geração em lote para alunos ativos (Cobrança Contínua Recorrente)
   */
  static async generateBatch(academiaId, { competencia, data_vencimento, valor_padrao = 120.00 }) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Obter todos os alunos ativos da academia com seus planos de mensalidade
      const [activeStudents] = await connection.query(
        `SELECT 
           id, 
           nome, 
           cobranca_continua, 
           CAST(valor_mensalidade AS DOUBLE) AS valor_mensalidade, 
           dia_vencimento, 
           validade_plano 
         FROM alunos 
         WHERE academia_id = ? AND status = 'ativo'`,
        [academiaId]
      );

      if (activeStudents.length === 0) {
        await connection.commit();
        return { geradas: 0, ignoradas: 0, ignoradas_existentes: 0, total_alunos_ativos: 0 };
      }

      // 2. Obter alunos que já possuem mensalidade nessa competência
      const [existingInvoices] = await connection.query(
        'SELECT aluno_id FROM mensalidades WHERE academia_id = ? AND competencia = ?',
        [academiaId, competencia]
      );
      const existingStudentIds = new Set(existingInvoices.map((i) => i.aluno_id));

      const todayStr = new Date().toISOString().split('T')[0];

      // Parse da competência para determinar o mês/ano
      let compMes = 1;
      let compAno = new Date().getFullYear();
      if (competencia.includes('/')) {
        const [m, y] = competencia.split('/');
        compMes = parseInt(m, 10);
        compAno = parseInt(y, 10);
      } else if (competencia.includes('-')) {
        const [y, m] = competencia.split('-');
        compMes = parseInt(m, 10);
        compAno = parseInt(y, 10);
      }

      // Primeiro dia do mês da competência (para checar validade do plano)
      const primeiroDiaComp = `${compAno}-${String(compMes).padStart(2, '0')}-01`;
      const diasNoMes = new Date(compAno, compMes, 0).getDate();

      let geradas = 0;
      let ignoradas = 0;
      let ignoradasExpiradas = 0;
      let ignoradasDesativadas = 0;

      for (const student of activeStudents) {
        // Se a cobrança contínua estiver desativada para o aluno
        if (student.cobranca_continua === 0 || student.cobranca_continua === false) {
          ignoradasDesativadas++;
          ignoradas++;
          continue;
        }

        // Se o plano tiver data de validade definida e ela tiver expirado antes do mês da competência
        if (student.validade_plano) {
          const validadeStr = student.validade_plano instanceof Date
            ? student.validade_plano.toISOString().split('T')[0]
            : (new Date(student.validade_plano).toISOString().split('T')[0]);

          if (validadeStr < primeiroDiaComp) {
            ignoradasExpiradas++;
            ignoradas++;
            continue;
          }
        }

        // Se já possui fatura gerada para esta competência
        if (existingStudentIds.has(student.id)) {
          ignoradas++;
          continue;
        }

        // Determinar valor da fatura: personalizado do aluno ou padrão
        const valorFinal = (student.valor_mensalidade && student.valor_mensalidade > 0)
          ? Number(student.valor_mensalidade)
          : Number(valor_padrao);

        // Determinar data de vencimento: dia personalizado do aluno ou padrão do lote
        let vencimentoFinal = data_vencimento;
        if (student.dia_vencimento && student.dia_vencimento >= 1 && student.dia_vencimento <= 31) {
          const dia = Math.min(student.dia_vencimento, diasNoMes);
          vencimentoFinal = `${compAno}-${String(compMes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        }

        const initialStatus = vencimentoFinal < todayStr ? 'atrasada' : 'pendente';

        await connection.query(
          `INSERT INTO mensalidades (academia_id, aluno_id, valor, valor_pago, data_vencimento, competencia, status, observacoes)
           VALUES (?, ?, ?, 0.00, ?, ?, ?, 'Cobrança Contínua Recorrente')`,
          [academiaId, student.id, valorFinal, vencimentoFinal, competencia, initialStatus]
        );
        geradas++;
      }

      await connection.commit();
      return {
        geradas,
        ignoradas,
        ignoradas_existentes: ignoradas - ignoradasExpiradas - ignoradasDesativadas,
        ignoradas_expiradas: ignoradasExpiradas,
        ignoradas_desativadas: ignoradasDesativadas,
        total_alunos_ativos: activeStudents.length
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Registra pagamento e quitação atômica
   */
  static async registerPayment(academiaId, mensalidadeId, paymentData, usuarioId = null) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Buscar fatura e travar linha (FOR UPDATE)
      const [rows] = await connection.query(
        `SELECT id, aluno_id, CAST(valor AS DOUBLE) AS valor, CAST(valor_pago AS DOUBLE) AS valor_pago, data_vencimento, status
         FROM mensalidades 
         WHERE id = ? AND academia_id = ? 
         FOR UPDATE`,
        [mensalidadeId, academiaId]
      );

      if (rows.length === 0) {
        throw new Error('Mensalidade não encontrada.');
      }

      const invoice = rows[0];
      if (invoice.status === 'cancelada') {
        throw new Error('Não é possível registrar pagamento em mensalidade cancelada.');
      }

      const saldoDevedor = Number((invoice.valor - invoice.valor_pago).toFixed(2));
      const valorRecebido = Number(Number(paymentData.valor).toFixed(2));

      if (valorRecebido <= 0) {
        throw new Error('O valor do pagamento deve ser maior que zero.');
      }

      if (valorRecebido > saldoDevedor) {
        throw new Error(
          `O valor informado (R$ ${valorRecebido.toFixed(2)}) excede o saldo devedor restante (R$ ${saldoDevedor.toFixed(2)}).`
        );
      }

      const dataPagamento = paymentData.data_pagamento || new Date().toISOString().split('T')[0];
      const formaPagamento = paymentData.forma_pagamento || 'pix';

      // 2. Inserir em pagamentos
      await connection.query(
        `INSERT INTO pagamentos (mensalidade_id, academia_id, aluno_id, valor, forma_pagamento, data_pagamento, observacao, usuario_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mensalidadeId,
          academiaId,
          invoice.aluno_id,
          valorRecebido,
          formaPagamento,
          dataPagamento,
          paymentData.observacao || null,
          usuarioId
        ]
      );

      // 3. Atualizar mensalidade
      const novoValorPago = Number((invoice.valor_pago + valorRecebido).toFixed(2));
      let novoStatus = invoice.status;

      if (novoValorPago >= invoice.valor) {
        novoStatus = 'paga';
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        novoStatus = invoice.data_vencimento < todayStr ? 'atrasada' : 'pendente';
      }

      await connection.query(
        'UPDATE mensalidades SET valor_pago = ?, status = ? WHERE id = ?',
        [novoValorPago, novoStatus, mensalidadeId]
      );

      await connection.commit();
      return {
        mensalidadeId,
        valorRecebido,
        novoValorPago,
        novoStatus
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Cancelamento de mensalidade
   */
  static async cancelInvoice(academiaId, mensalidadeId) {
    const [payments] = await pool.query(
      'SELECT id FROM pagamentos WHERE mensalidade_id = ? AND academia_id = ? LIMIT 1',
      [mensalidadeId, academiaId]
    );

    if (payments.length > 0) {
      throw new Error('Esta mensalidade possui pagamentos vinculados e não pode ser cancelada diretamente.');
    }

    const [result] = await pool.query(
      "UPDATE mensalidades SET status = 'cancelada' WHERE id = ? AND academia_id = ?",
      [mensalidadeId, academiaId]
    );

    return result.affectedRows > 0;
  }
}
