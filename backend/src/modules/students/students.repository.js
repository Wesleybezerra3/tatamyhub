import pool from '../../config/database.js';

export class StudentsRepository {
  /**
   * Lista alunos com filtros por busca, modalidade e status
   */
  static async list(academiaId, { search, modalidadeId, status } = {}) {
    let query = `
      SELECT 
        a.id,
        a.nome,
        a.telefone,
        a.data_nascimento,
        a.data_matricula,
        a.observacoes_medicas,
        a.status,
        a.cobranca_continua,
        CAST(a.valor_mensalidade AS DOUBLE) AS valor_mensalidade,
        a.dia_vencimento,
        a.validade_plano,
        am.modalidade_id,
        m.nome AS modalidade_nome,
        am.faixa_atual,
        am.graus_atual
      FROM alunos a
      LEFT JOIN aluno_modalidades am ON a.id = am.aluno_id
      LEFT JOIN modalidades m ON am.modalidade_id = m.id
      WHERE a.academia_id = ?
    `;

    const params = [academiaId];

    if (status && status !== 'todos') {
      query += ' AND a.status = ?';
      params.push(status);
    } else if (!status) {
      // Padrão: ativos primeiro
      query += " AND a.status = 'ativo'";
    }

    if (search && search.trim()) {
      query += ' AND a.nome LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (modalidadeId) {
      query += ' AND am.modalidade_id = ?';
      params.push(modalidadeId);
    }

    query += ' ORDER BY a.status ASC, a.nome ASC';

    const [rows] = await pool.query(query, params);

    // Agrupa modalidades por aluno
    const studentsMap = new Map();
    for (const row of rows) {
      if (!studentsMap.has(row.id)) {
        studentsMap.set(row.id, {
          id: row.id,
          nome: row.nome,
          telefone: row.telefone,
          data_nascimento: row.data_nascimento,
          data_matricula: row.data_matricula,
          observacoes_medicas: row.observacoes_medicas,
          status: row.status,
          cobranca_continua: row.cobranca_continua === 1 || row.cobranca_continua === true,
          valor_mensalidade: row.valor_mensalidade !== null ? row.valor_mensalidade : null,
          dia_vencimento: row.dia_vencimento || 10,
          validade_plano: row.validade_plano 
            ? (row.validade_plano instanceof Date ? row.validade_plano.toISOString().split('T')[0] : String(row.validade_plano).split('T')[0])
            : null,
          modalidade_nome: row.modalidade_nome || 'Geral',
          faixa_atual: row.faixa_atual || 'Branca',
          graus_atual: row.graus_atual || 0,
          modalidades: []
        });
      }

      if (row.modalidade_id) {
        studentsMap.get(row.id).modalidades.push({
          modalidade_id: row.modalidade_id,
          modalidade_nome: row.modalidade_nome,
          faixa_atual: row.faixa_atual,
          graus_atual: row.graus_atual
        });
      }
    }

    return Array.from(studentsMap.values());
  }

  /**
   * Busca um aluno específico com modalidades e linha do tempo de graduações
   */
  static async findById(academiaId, alunoId) {
    const [alunoRows] = await pool.query(
      `SELECT 
        id, 
        academia_id, 
        nome, 
        telefone, 
        data_nascimento, 
        data_matricula, 
        observacoes_medicas, 
        status, 
        cobranca_continua,
        CAST(valor_mensalidade AS DOUBLE) AS valor_mensalidade,
        dia_vencimento,
        validade_plano,
        created_at, 
        updated_at
       FROM alunos 
       WHERE id = ? AND academia_id = ?`,
      [alunoId, academiaId]
    );

    if (alunoRows.length === 0) {
      return null;
    }

    const aluno = {
      ...alunoRows[0],
      cobranca_continua: alunoRows[0].cobranca_continua === 1 || alunoRows[0].cobranca_continua === true,
      validade_plano: alunoRows[0].validade_plano 
        ? (alunoRows[0].validade_plano instanceof Date ? alunoRows[0].validade_plano.toISOString().split('T')[0] : String(alunoRows[0].validade_plano).split('T')[0])
        : null
    };

    // Modalidades vinculadas
    const [modalidadesRows] = await pool.query(
      `SELECT am.id, am.modalidade_id, m.nome AS modalidade_nome, am.faixa_atual, am.graus_atual, am.data_inicio
       FROM aluno_modalidades am
       JOIN modalidades m ON am.modalidade_id = m.id
       WHERE am.aluno_id = ?`,
      [alunoId]
    );

    // Histórico cronológico de graduações
    const [historicoRows] = await pool.query(
      `SELECT gh.id, gh.modalidade_id, m.nome AS modalidade_nome, gh.faixa, gh.graus, gh.data_graduacao, gh.observacao, gh.created_at,
              u.nome AS promovido_por_nome
       FROM graduacoes_historico gh
       JOIN modalidades m ON gh.modalidade_id = m.id
       LEFT JOIN usuarios u ON gh.promovido_por_usuario_id = u.id
       WHERE gh.aluno_id = ?
       ORDER BY gh.data_graduacao DESC, gh.id DESC`,
      [alunoId]
    );

    return {
      ...aluno,
      modalidades: modalidadesRows,
      historico_graduacoes: historicoRows
    };
  }

  /**
   * Cria aluno, vincula modalidade inicial e registra graduação inicial em transação atômica
   */
  static async create(academiaId, studentData, usuarioId = null) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const dataMatricula = studentData.data_matricula || new Date().toISOString().split('T')[0];

      // 1. Inserir aluno
      const cobrancaContinua = studentData.cobranca_continua !== undefined ? (studentData.cobranca_continua ? 1 : 0) : 1;
      const valorMensalidade = studentData.valor_mensalidade !== undefined && studentData.valor_mensalidade !== '' && studentData.valor_mensalidade !== null
        ? Number(studentData.valor_mensalidade)
        : null;
      const diaVencimento = studentData.dia_vencimento ? parseInt(studentData.dia_vencimento, 10) : 10;
      const validadePlano = studentData.validade_plano || null;

      const [alunoResult] = await connection.query(
        `INSERT INTO alunos (academia_id, nome, telefone, data_nascimento, data_matricula, observacoes_medicas, status, cobranca_continua, valor_mensalidade, dia_vencimento, validade_plano)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          academiaId,
          studentData.nome.trim(),
          studentData.telefone || null,
          studentData.data_nascimento || null,
          dataMatricula,
          studentData.observacoes_medicas || null,
          studentData.status || 'ativo',
          cobrancaContinua,
          valorMensalidade,
          diaVencimento,
          validadePlano
        ]
      );

      const alunoId = alunoResult.insertId;

      // 2. Se houver modalidade_id, vincular em aluno_modalidades
      if (studentData.modalidade_id) {
        const faixa = studentData.faixa_inicial || 'Branca';
        const graus = Number(studentData.graus_inicial) || 0;

        await connection.query(
          `INSERT INTO aluno_modalidades (aluno_id, modalidade_id, faixa_atual, graus_atual, data_inicio)
           VALUES (?, ?, ?, ?, ?)`,
          [alunoId, studentData.modalidade_id, faixa, graus, dataMatricula]
        );

        // 3. Registrar no histórico de graduações como início
        await connection.query(
          `INSERT INTO graduacoes_historico (aluno_id, modalidade_id, faixa, graus, data_graduacao, observacao, promovido_por_usuario_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [alunoId, studentData.modalidade_id, faixa, graus, dataMatricula, 'Matrícula e graduação de entrada', usuarioId]
        );
      }

      // 4. Gerar primeira mensalidade anexada ao aluno no cadastro
      const gerarPrimeira = studentData.gerar_primeira_mensalidade !== false;
      const valorCobranca = (valorMensalidade && valorMensalidade > 0)
        ? valorMensalidade
        : (studentData.valor_primeira_mensalidade ? Number(studentData.valor_primeira_mensalidade) : 150.00);

      if (gerarPrimeira && (cobrancaContinua || valorCobranca > 0)) {
        const dataBase = dataMatricula || new Date().toISOString().split('T')[0];
        const [anoMatrStr, mesMatrStr, diaMatrStr] = dataBase.split('-');
        const anoMatr = parseInt(anoMatrStr, 10);
        const mesMatr = parseInt(mesMatrStr, 10); // 1-12
        const diaMatr = parseInt(diaMatrStr, 10);

        // Se o vencimento no mês de matrícula já passou (ex: matrícula dia 17 e vencimento dia 10)
        // e o usuário não forçou 'mes_atual', a cobrança deve iniciar no próximo mês!
        const vencimentoJaPassou = diaVencimento < diaMatr;
        const cobrarProximoMes = studentData.inicio_cobranca === 'proximo_mes' || 
          (studentData.inicio_cobranca !== 'mes_atual' && vencimentoJaPassou);

        let anoComp, mesComp;
        if (cobrarProximoMes) {
          // Avança para o próximo mês com proteção de virada de ano
          const proxData = new Date(anoMatr, mesMatr, 1);
          anoComp = proxData.getFullYear();
          mesComp = proxData.getMonth() + 1;
        } else {
          anoComp = anoMatr;
          mesComp = mesMatr;
        }

        const mesCompStr = String(mesComp).padStart(2, '0');
        const competencia = `${mesCompStr}/${anoComp}`;

        // Determinar data de vencimento:
        let dataVencimento;
        if (studentData.data_primeiro_vencimento) {
          dataVencimento = studentData.data_primeiro_vencimento;
        } else {
          const diasNoMes = new Date(anoComp, mesComp, 0).getDate();
          const diaFinal = Math.min(diaVencimento, diasNoMes);
          dataVencimento = `${anoComp}-${mesCompStr}-${String(diaFinal).padStart(2, '0')}`;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const statusInicial = dataVencimento < todayStr ? 'atrasada' : 'pendente';

        await connection.query(
          `INSERT INTO mensalidades (academia_id, aluno_id, valor, valor_pago, data_vencimento, competencia, status, observacoes)
           VALUES (?, ?, ?, 0.00, ?, ?, ?, 'Mensalidade Inicial (Matrícula)')`,
          [academiaId, alunoId, valorCobranca, dataVencimento, competencia, statusInicial]
        );
      }

      await connection.commit();
      return alunoId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Atualiza dados cadastrais do aluno
   */
  static async update(academiaId, alunoId, studentData) {
    const fields = [];
    const values = [];

    if (studentData.nome !== undefined) {
      fields.push('nome = ?');
      values.push(studentData.nome.trim());
    }
    if (studentData.telefone !== undefined) {
      fields.push('telefone = ?');
      values.push(studentData.telefone);
    }
    if (studentData.data_nascimento !== undefined) {
      fields.push('data_nascimento = ?');
      values.push(studentData.data_nascimento || null);
    }
    if (studentData.data_matricula !== undefined) {
      fields.push('data_matricula = ?');
      values.push(studentData.data_matricula);
    }
    if (studentData.observacoes_medicas !== undefined) {
      fields.push('observacoes_medicas = ?');
      values.push(studentData.observacoes_medicas || null);
    }
    if (studentData.status !== undefined) {
      fields.push('status = ?');
      values.push(studentData.status);
    }
    if (studentData.cobranca_continua !== undefined) {
      fields.push('cobranca_continua = ?');
      values.push(studentData.cobranca_continua ? 1 : 0);
    }
    if (studentData.valor_mensalidade !== undefined) {
      fields.push('valor_mensalidade = ?');
      const val = studentData.valor_mensalidade !== '' && studentData.valor_mensalidade !== null
        ? Number(studentData.valor_mensalidade)
        : null;
      values.push(val);
    }
    if (studentData.dia_vencimento !== undefined) {
      fields.push('dia_vencimento = ?');
      values.push(parseInt(studentData.dia_vencimento, 10) || 10);
    }
    if (studentData.validade_plano !== undefined) {
      fields.push('validade_plano = ?');
      values.push(studentData.validade_plano || null);
    }

    if (fields.length === 0) return true;

    values.push(alunoId, academiaId);

    const [result] = await pool.query(
      `UPDATE alunos SET ${fields.join(', ')} WHERE id = ? AND academia_id = ?`,
      values
    );

    // Se solicitado gerar fatura do mês atual caso ainda não exista
    if (studentData.gerar_mensalidade_mes) {
      const today = new Date();
      const diaHoje = today.getDate();
      const diaVenc = studentData.dia_vencimento ? parseInt(studentData.dia_vencimento, 10) : 10;

      const vencimentoJaPassou = diaVenc < diaHoje;
      const cobrarProximoMes = studentData.inicio_cobranca === 'proximo_mes' || 
        (studentData.inicio_cobranca !== 'mes_atual' && vencimentoJaPassou);

      let anoComp, mesComp;
      if (cobrarProximoMes) {
        const proxData = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        anoComp = proxData.getFullYear();
        mesComp = proxData.getMonth() + 1;
      } else {
        anoComp = today.getFullYear();
        mesComp = today.getMonth() + 1;
      }

      const mesStr = String(mesComp).padStart(2, '0');
      const anoStr = String(anoComp);
      const competencia = `${mesStr}/${anoStr}`;

      const [existing] = await pool.query(
        'SELECT id FROM mensalidades WHERE academia_id = ? AND aluno_id = ? AND competencia = ?',
        [academiaId, alunoId, competencia]
      );

      if (existing.length === 0) {
        const diasNoMes = new Date(anoComp, mesComp, 0).getDate();
        const diaFinal = Math.min(diaVenc, diasNoMes);
        const dataVenc = `${anoStr}-${mesStr}-${String(diaFinal).padStart(2, '0')}`;
        const val = Number(studentData.valor_mensalidade) || 150.00;
        const todayStr = today.toISOString().split('T')[0];
        const status = dataVenc < todayStr ? 'atrasada' : 'pendente';

        await pool.query(
          `INSERT INTO mensalidades (academia_id, aluno_id, valor, valor_pago, data_vencimento, competencia, status, observacoes)
           VALUES (?, ?, ?, 0.00, ?, ?, ?, 'Mensalidade Contínua (Atualização de Plano)')`,
          [academiaId, alunoId, val, dataVenc, competencia, status]
        );
      }
    }

    return result.affectedRows > 0;
  }

  /**
   * Altera status (ativo/inativo)
   */
  static async setStatus(academiaId, alunoId, status) {
    const [result] = await pool.query(
      'UPDATE alunos SET status = ? WHERE id = ? AND academia_id = ?',
      [status, alunoId, academiaId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Registra nova graduação e atualiza a faixa atual da modalidade
   */
  static async addGraduation(academiaId, alunoId, graduationData, usuarioId = null) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Validar posse do aluno
      const [alunoRows] = await connection.query(
        'SELECT id FROM alunos WHERE id = ? AND academia_id = ?',
        [alunoId, academiaId]
      );

      if (alunoRows.length === 0) {
        throw new Error('Aluno não encontrado.');
      }

      const { modalidade_id, faixa, graus = 0, data_graduacao, observacao } = graduationData;
      const dataGrad = data_graduacao || new Date().toISOString().split('T')[0];

      // 2. Inserir no histórico de graduações
      await connection.query(
        `INSERT INTO graduacoes_historico (aluno_id, modalidade_id, faixa, graus, data_graduacao, observacao, promovido_por_usuario_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [alunoId, modalidade_id, faixa, graus, dataGrad, observacao || null, usuarioId]
      );

      // 3. Atualizar ou inserir em aluno_modalidades
      const [existingMod] = await connection.query(
        'SELECT id FROM aluno_modalidades WHERE aluno_id = ? AND modalidade_id = ?',
        [alunoId, modalidade_id]
      );

      if (existingMod.length > 0) {
        await connection.query(
          `UPDATE aluno_modalidades 
           SET faixa_atual = ?, graus_atual = ?
           WHERE aluno_id = ? AND modalidade_id = ?`,
          [faixa, graus, alunoId, modalidade_id]
        );
      } else {
        await connection.query(
          `INSERT INTO aluno_modalidades (aluno_id, modalidade_id, faixa_atual, graus_atual, data_inicio)
           VALUES (?, ?, ?, ?, ?)`,
          [alunoId, modalidade_id, faixa, graus, dataGrad]
        );
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Exclui o aluno e todos os dados vinculados em cascata (modalidades, graduações, mensalidades e pagamentos)
   */
  static async delete(academiaId, alunoId) {
    const [result] = await pool.query(
      'DELETE FROM alunos WHERE id = ? AND academia_id = ?',
      [alunoId, academiaId]
    );
    return result.affectedRows > 0;
  }
}
