import axios from 'axios';

const API_BASE = 'http://52.65.58.208';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});


export async function getStudents() {
  try {
    const { data } = await api.get('/records/default');
    console.log('Backend response:', data);

    if (!data || !data.records) {
      console.warn('No records in response');
      return { students: [], total: 0 };
    }

    const records = data.records || [];
    console.log('First record sample:', records[0]);
    console.log('Weak topics check:', {
      weak_topics: records[0]?.weak_topics,
      Weak_Topics: records[0]?.Weak_Topics,
      weakTopics: records[0]?.weakTopics,
      weak_areas: records[0]?.weak_areas,
      Weak_Areas: records[0]?.Weak_Areas
    });

    // Flatten features object into individual columns
    const students = records.map(record => {
      const student = {
        ...record, // Include ALL fields from backend
        student_id: record.id || record.record_id || record.student_id || record.ID || record.Student_ID,
        pass_probability: record.prediction || record.pass_probability || record.Pass_Probability || record.probability,
        risk_level: record.risk_level || record.Risk_Level || record.risk || record.Risk,
        weak_topics: record.weak_topics || record.Weak_Topics || record.weakTopics || record.WeakTopics || record.weak_areas || record.Weak_Areas || [],
        topic_scores: record.topic_scores || record.Topic_Scores || record.topicScores || record.TopicScores || {}
      };

      // If there's a 'features' object, flatten it into individual columns
      if (record.features && typeof record.features === 'object') {
        Object.keys(record.features).forEach(key => {
          student[key] = record.features[key];
        });
        // Remove the features object itself
        delete student.features;
      }

      return student;
    });

    console.log('Total students transformed:', students.length);
    console.log('Sample transformed student:', students[0]);

    return {
      students: students,
      total: data.total || students.length
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    console.error('Error response:', error.response?.data);

    if (error.response?.status === 404) {
      return { students: [], total: 0 };
    }

    throw error;
  }
}

export async function getStudentById(studentId) {
  try {
    const { data } = await api.get(`/records/default/${studentId}`);
    
    if (!data) {
      throw new Error('Student not found');
    }

    // Apply same transformation as getStudents
    const student = {
      ...data,
      student_id: data.id || data.record_id || data.student_id || data.ID || data.Student_ID,
      pass_probability: data.prediction || data.pass_probability || data.Pass_Probability || data.probability,
      risk_level: data.risk_level || data.Risk_Level || data.risk || data.Risk,
      weak_topics: data.weak_topics || data.Weak_Topics || data.weakTopics || data.WeakTopics || data.weak_areas || data.Weak_Areas || [],
      topic_scores: data.topic_scores || data.Topic_Scores || data.topicScores || data.TopicScores || {}
    };

    // Flatten features object if it exists
    if (data.features && typeof data.features === 'object') {
      Object.keys(data.features).forEach(key => {
        student[key] = data.features[key];
      });
      delete student.features;
    }

    return student;
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    throw error;
  }
}


export async function askAdvisor(query) {
  const { data } = await api.post('/ask_advisor', { 
    query,
    dataset_id: 'default'
  });
  return data;
}


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
