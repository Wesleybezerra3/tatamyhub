import { StudentsService } from './students.service.js';

export async function listStudents(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const { search, modalidade_id, status } = req.query;

    const students = await StudentsService.list(academiaId, {
      search,
      modalidadeId: modalidade_id ? parseInt(modalidade_id, 10) : undefined,
      status
    });

    return res.status(200).json(students);
  } catch (err) {
    console.error('[StudentsController] Erro ao listar alunos:', err.message);
    return res.status(500).json({ error: err.message || 'Erro ao listar alunos.' });
  }
}

export async function getStudentById(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const alunoId = parseInt(req.params.id, 10);

    const student = await StudentsService.getById(academiaId, alunoId);
    return res.status(200).json(student);
  } catch (err) {
    const status = err.message.includes('não encontrado') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}

export async function createStudent(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const usuarioId = req.user?.id || null;

    const student = await StudentsService.create(academiaId, req.body, usuarioId);
    return res.status(201).json(student);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function updateStudent(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const alunoId = parseInt(req.params.id, 10);

    const updated = await StudentsService.update(academiaId, alunoId, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    const status = err.message.includes('não encontrado') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}

export async function setStudentStatus(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const alunoId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const result = await StudentsService.setStatus(academiaId, alunoId, status);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes('não encontrado') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}

export async function addGraduation(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const alunoId = parseInt(req.params.id, 10);
    const usuarioId = req.user?.id || null;

    const student = await StudentsService.addGraduation(academiaId, alunoId, req.body, usuarioId);
    return res.status(201).json(student);
  } catch (err) {
    const status = err.message.includes('não encontrado') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const alunoId = parseInt(req.params.id, 10);

    const result = await StudentsService.delete(academiaId, alunoId);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes('não encontrado') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}
