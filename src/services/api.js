import axios from 'axios';

const API_BASE = '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ========== Students ==========
export async function getStudents() {
  const { data } = await api.get('/students');
  return data;
}

export async function getStudentById(studentId) {
  const { data } = await api.get(`/students/${studentId}`);
  return data;
}

// ========== AI Advisor ==========
export async function askAdvisor(query) {
  const { data } = await api.post('/ask_advisor', { query });
  return data;
}

export default api;
