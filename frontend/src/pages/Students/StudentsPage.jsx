import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, Filter, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { modalityService } from '../../services/modalityService';
import { StudentCard } from '../../components/students/StudentCard/StudentCard';
import { StudentModal } from '../../components/students/StudentModal/StudentModal';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './StudentsPage.module.css';

export function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState('todas');
  const [showInactive, setShowInactive] = useState(false);

  // Modal Novo Aluno
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, modalitiesData] = await Promise.all([
        studentService.listStudents({ status: showInactive ? 'todos' : 'ativo' }),
        modalityService.listModalities('ativa')
      ]);
      setStudents(studentsData);
      setModalities(modalitiesData);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados dos alunos.' });
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtragem em memória (busca instantânea < 50ms)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filtro de busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = student.nome.toLowerCase().includes(term);
        const matchesPhone = student.telefone && student.telefone.includes(term);
        if (!matchesName && !matchesPhone) return false;
      }

      // Filtro de modalidade
      if (selectedModality !== 'todas') {
        const hasModality = student.modalidades?.some(
          (m) => String(m.modalidade_id) === String(selectedModality)
        ) || String(student.modalidade_id) === String(selectedModality);
        if (!hasModality) return false;
      }

      return true;
    });
  }, [students, searchTerm, selectedModality]);

  const handleCreateStudent = async (studentData) => {
    const created = await studentService.createStudent(studentData);
    setFeedback({ type: 'success', message: `Aluno ${created.nome} matriculado com sucesso!` });
    fetchData();
  };

  const handleSelectStudent = (student) => {
    navigate(`/alunos/${student.id}`);
  };

  return (
    <div className={styles.page}>
      {/* Header com Título e Ação Desktop */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleWithIcon}>
            <div className={styles.badgeIcon}>
              <Users size={22} className={styles.icon} />
            </div>
            <div>
              <h1 className={styles.title}>Gestão de Alunos</h1>
              <p className={styles.subtitle}>
                {loading
                  ? 'Carregando lista de matriculados...'
                  : `${students.length} aluno(s) cadastrado(s)`}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={styles.desktopNewBtn}
        >
          <UserPlus size={18} />
          <span>Novo Aluno</span>
        </button>
      </header>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Barra de Busca e Filtros */}
      <section className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className={styles.clearSearchBtn}
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Pílulas de Modalidades */}
        <div className={styles.filtersBar}>
          <div className={styles.pillsScroll}>
            <button
              type="button"
              onClick={() => setSelectedModality('todas')}
              className={`${styles.filterPill} ${selectedModality === 'todas' ? styles.filterPillActive : ''}`}
            >
              Todas as Modalidades
            </button>

            {modalities.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModality(String(mod.id))}
                className={`${styles.filterPill} ${selectedModality === String(mod.id) ? styles.filterPillActive : ''}`}
              >
                {mod.nome}
              </button>
            ))}
          </div>

          {/* Toggle Mostrar Inativos */}
          <button
            type="button"
            onClick={() => setShowInactive(!showInactive)}
            className={`${styles.inactiveToggle} ${showInactive ? styles.inactiveToggleActive : ''}`}
          >
            <span>{showInactive ? 'Ocultar Inativos' : 'Mostrar Inativos'}</span>
          </button>
        </div>
      </section>

      {/* Listagem de Alunos */}
      <section className={styles.listSection}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Carregando alunos do tatame...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Users size={32} className={styles.emptyIcon} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchTerm || selectedModality !== 'todas'
                ? 'Nenhum aluno encontrado para os filtros aplicados'
                : 'Nenhum aluno matriculado ainda'}
            </h3>
            <p className={styles.emptyText}>
              {searchTerm || selectedModality !== 'todas'
                ? 'Tente ajustar os termos da busca ou limpar os filtros de modalidade.'
                : 'Cadastre seu primeiro aluno para começar a gerenciar faixas, presenças e mensalidades.'}
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={styles.emptyActionBtn}
            >
              <UserPlus size={16} />
              <span>Matricular Primeiro Aluno</span>
            </button>
          </div>
        ) : (
          <div className={styles.studentsGrid}>
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={handleSelectStudent}
              />
            ))}
          </div>
        )}
      </section>

      {/* Botão Flutuante (FAB) para Mobile (< 640px) */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={styles.fabBtn}
        aria-label="Cadastrar novo aluno"
        title="Novo Aluno"
      >
        <UserPlus size={24} />
      </button>

      {/* Modal de Criação de Aluno */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateStudent}
        modalities={modalities}
      />
    </div>
  );
}
