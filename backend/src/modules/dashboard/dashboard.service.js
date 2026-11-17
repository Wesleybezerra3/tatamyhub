import { DashboardRepository } from './dashboard.repository.js';

export class DashboardService {
  static async getMetrics(academiaId = 1) {
    const rawMetrics = await DashboardRepository.getMetrics(academiaId);

    return {
      alunos_ativos: Number(rawMetrics.alunos_ativos) || 0,
      mensalidades_atrasadas_qtd: Number(rawMetrics.mensalidades_atrasadas_qtd) || 0,
      mensalidades_atrasadas_valor: Number(rawMetrics.mensalidades_atrasadas_valor) || 0,
      arrecadado_mes_valor: Number(rawMetrics.arrecadado_mes_valor) || 0,
      modalidades_ativas_qtd: Number(rawMetrics.modalidades_ativas_qtd) || 0,
      alertas: rawMetrics.alertas || []
    };
  }
}
