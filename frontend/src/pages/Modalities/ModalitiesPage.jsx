import React, { useState, useEffect, useCallback } from 'react';
import { Layers, Plus, Check, Edit2, X, Power, Loader2 } from 'lucide-react';
import { modalityService } from '../../services/modalityService';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './ModalitiesPage.module.css';

export function ModalitiesPage() {
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form de criação
  const [newNome, setNewNome] = useState('');
  const [newDescricao, setNewDescricao] = useState('');

  // Edição inline
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editDescricao, setEditDescricao] = useState('');

  const loadModalities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await modalityService.listModalities('todas');
      setModalities(data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar modalidades.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModalities();
  }, [loadModalities]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newNome.trim()) {
      setFeedback({ type: 'error', message: 'O nome da modalidade é obrigatório.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const created = await modalityService.createModality({
        nome: newNome.trim(),
        descricao: newDescricao.trim() || null,
        status: 'ativa'
      });
      setModalities(prev => [...prev, created]);
      setNewNome('');
      setNewDescricao('');
      setFeedback({ type: 'success', message: `Modalidade "${created.nome}" adicionada com sucesso!` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao adicionar modalidade.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'ativa' ? 'inativa' : 'ativa';
    try {
      const updated = await modalityService.updateModality(item.id, { status: nextStatus });
      setModalities(prev => prev.map(m => m.id === item.id ? updated : m));
      setFeedback({ 
        type: 'success', 
        message: `Modalidade "${updated.nome}" definida como ${nextStatus === 'ativa' ? 'ativa' : 'inativa'}.` 
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao alterar status.' });
    }
  };

  const startEdit = async (item) => {
    setEditingId(item.id);
    setEditNome(item.nome);
    setEditDescricao(item.descricao || '');

    try {
      const freshData = await modalityService.getModality(item.id);
      if (freshData) {
        setEditNome(freshData.nome || item.nome);
        setEditDescricao(freshData.descricao || '');
      }
    } catch {
      // Mantém os dados locais caso ocorra falha de rede
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNome('');
    setEditDescricao('');
  };

  const handleSaveEdit = async (id) => {
    if (!editNome.trim()) {
      setFeedback({ type: 'error', message: 'O nome da modalidade não pode ser vazio.' });
      return;
    }

    try {
      const updated = await modalityService.updateModality(id, {
        nome: editNome.trim(),
        descricao: editDescricao.trim() || null
      });
      setModalities(prev => prev.map(m => m.id === id ? updated : m));
      cancelEdit();
      setFeedback({ type: 'success', message: 'Modalidade atualizada com sucesso!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar alterações.' });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Modalidades Esportivas</h1>
        <p className={styles.pageSubtitle}>
          Gerencie as artes marciais e treinos oferecidos pela academia aos seus alunos.
        </p>
      </header>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Formulário de Adicionar Modalidade */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <Plus size={18} className={styles.sectionIcon} />
          <h2>Adicionar Nova Modalidade</h2>
        </div>

        <form onSubmit={handleCreate} className={styles.addForm}>
          <div className={styles.field}>
            <label htmlFor="newNome">Nome da Modalidade</label>
            <input
              id="newNome"
              type="text"
              placeholder="Ex: Jiu-Jitsu, Muay Thai, No-Gi"
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="newDescricao">Descrição ou Categoria (opcional)</label>
            <input
              id="newDescricao"
              type="text"
              placeholder="Ex: Turmas Adulto e Kids"
              value={newDescricao}
              onChange={(e) => setNewDescricao(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className={styles.addButton}
            disabled={submitting || !newNome.trim()}
          >
            {submitting ? (
              <Loader2 className={styles.spinner} size={18} />
            ) : (
              <Plus size={18} />
            )}
            <span>Adicionar Modalidade</span>
          </button>
        </form>
      </section>

      {/* Lista de Modalidades */}
      <section className={styles.listSection}>
        <div className={styles.listHeader}>
          <Layers size={18} className={styles.sectionIcon} />
          <h2>Modalidades Cadastradas ({modalities.length})</h2>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={28} />
            <p>Carregando modalidades...</p>
          </div>
        ) : modalities.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyBadge}>
              <Layers size={32} />
            </div>
            <h3>Nenhuma modalidade cadastrada</h3>
            <p>Comece adicionando a modalidade principal da sua academia (ex: Jiu-Jitsu).</p>
            <button
              type="button"
              className={styles.quickAddButton}
              onClick={() => {
                setNewNome('Jiu-Jitsu');
                setNewDescricao('Aulas tradicionais com quimono (Gi)');
              }}
            >
              Sugerir "Jiu-Jitsu"
            </button>
          </div>
        ) : (
          <div className={styles.modalityList}>
            {modalities.map((item) => (
              <div 
                key={item.id} 
                className={`${styles.modalityCard} ${item.status === 'inativa' ? styles.cardInactive : ''}`}
              >
                {editingId === item.id ? (
                  <div className={styles.editRow}>
                    <div className={styles.editFields}>
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className={styles.editInput}
                        placeholder="Nome da modalidade"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value)}
                        className={styles.editInput}
                        placeholder="Descrição (opcional)"
                      />
                    </div>
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(item.id)}
                        className={styles.saveEditBtn}
                        aria-label="Salvar alteração"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={styles.cancelEditBtn}
                        aria-label="Cancelar edição"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.modalityRow}>
                    <div className={styles.infoCol}>
                      <div className={styles.titleLine}>
                        <span className={styles.modalityName}>{item.nome}</span>
                        <span className={`${styles.statusBadge} ${item.status === 'ativa' ? styles.badgeActive : styles.badgeInactive}`}>
                          {item.status === 'ativa' ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      {item.descricao && (
                        <p className={styles.modalityDescription}>{item.descricao}</p>
                      )}
                    </div>

                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className={styles.iconBtn}
                        title="Editar nome"
                        aria-label="Editar nome da modalidade"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`${styles.toggleBtn} ${item.status === 'ativa' ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
                        title={item.status === 'ativa' ? 'Desativar modalidade' : 'Ativar modalidade'}
                        aria-label="Alternar status da modalidade"
                      >
                        <Power size={16} />
                        <span>{item.status === 'ativa' ? 'Desativar' : 'Ativar'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
