import axios from 'axios';

const API_BASE = 'https://tubby-nondeviously-braelyn.ngrok-free.dev';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ========== Students ==========
export async function getStudents() {
  try {
    const { data } = await api.get('/records/default');
    console.log('Backend response:', data);
    
    if (!data || !data.records) {
      console.warn('No records in response');
      return { students: [], total: 0 };
    }
    
    const records = data.records || [];
    const students = records.map(record => {
      console.log('Processing record:', record);
      return {
        student_id: record.id || record.record_id || record.student_id,
        attendance: record.attendance,
        internal_marks: record.internal_marks,
        assignment_marks: record.assignment_marks,
        previous_gpa: record.previous_gpa,
        pass_probability: record.prediction || record.pass_probability,
        risk_level: record.risk_level,
        weak_topics: record.weak_topics || [],
        topic_scores: record.topic_scores || {}
      };
    });
    
    console.log('Transformed students:', students);
    
    return {
      students: students,
      total: data.total || students.length
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    console.error('Error response:', error.response?.data);
    
    // If dataset doesn't exist yet, return empty
    if (error.response?.status === 404) {
      return { students: [], total: 0 };
    }
    
    throw error;
  }
}

export async function getStudentById(studentId) {
  const { data } = await api.get(`/records/default/${studentId}`);
  return data;
}

// ========== AI Advisor ==========
export async function askAdvisor(query) {
  const { data } = await api.post('/ask_advisor', { 
    query,
    dataset_id: 'default'
  });
  return data;
}

// ========== CSV Upload ==========
export async function uploadCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/upload_csv?dataset_id=default', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30000,
  });
  
  return data;
}

export default api;
