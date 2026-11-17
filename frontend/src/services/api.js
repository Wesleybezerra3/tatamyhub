function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (envUrl.startsWith('/')) {
      return envUrl.replace(/\/$/, '');
    }
    try {
      const parsed = new URL(envUrl);
      // Se a variável aponta para localhost mas estamos acessando via IP da rede (ex: 172.x, 192.x)
      if (typeof window !== 'undefined' && parsed.hostname === 'localhost' && window.location.hostname !== 'localhost') {
        parsed.hostname = window.location.hostname;
        return parsed.toString().replace(/\/$/, '');
      }
      return envUrl.replace(/\/$/, '');
    } catch {
      return envUrl;
    }
  }

  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:3001/api`;
}

const BASE_URL = getBaseUrl();

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = data?.error || `Erro na requisição: ${response.status} ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data?.details || null;
    throw error;
  }

  return data;
}

function getAuthHeaders(extraHeaders = {}, endpoint = '') {
  const isPublicRoute = endpoint === '/auth/login' || endpoint === '/auth/register' || endpoint === '/aluno/login';
  if (isPublicRoute) {
    return { ...extraHeaders };
  }

  // Apenas rotas sob /aluno/... (ex: /aluno/hub, /aluno/me) pertencem ao portal do aluno.
  // Rotas sob /alunos (ex: /alunos, /alunos/26) pertencem à gestão administrativa.
  const isStudentEndpoint = typeof endpoint === 'string' && (endpoint === '/aluno' || endpoint.startsWith('/aluno/'));
  const token = typeof localStorage !== 'undefined'
    ? (isStudentEndpoint ? localStorage.getItem('tatamyhub_aluno_token') : localStorage.getItem('tatamyhub_token'))
    : null;
  const headers = { ...extraHeaders };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get(endpoint, params = {}) {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(`${BASE_URL}${endpoint}`, base);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders({
        'Accept': 'application/json'
      }, endpoint)
    });
    return handleResponse(response);
  },

  async post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, endpoint),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async put(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, endpoint),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async patch(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }, endpoint),
      body: JSON.stringify(body)
    });
    return handleResponse(response);
  },

  async delete(endpoint, body = null) {
    const headers = getAuthHeaders({
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    }, endpoint);
    const options = {
      method: 'DELETE',
      headers
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return handleResponse(response);
  },

  async upload(endpoint, formData) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    return handleResponse(response);
  }
};
