import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadCSV } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './Upload.css';

export default function Upload() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Upload Data – Student Advisor AI';
    return () => { document.title = 'Student Advisor AI'; };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      performUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        performUpload(file);
      } else {
        addToast('Please upload a CSV file', 'error');
      }
    }
  };

  const performUpload = async (file) => {
    setUploading(true);
    try {
      console.log('Uploading file:', file.name);
      const response = await uploadCSV(file);
      console.log('Upload response:', response);
      addToast(response.message || 'CSV uploaded successfully', 'success');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Navigate to students page after successful upload
      setTimeout(() => {
        navigate('/students');
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload CSV';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please try again.';
      } else if (error.response) {
        errorMessage = error.response.data?.detail 
          || error.response.data?.message 
          || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      addToast(errorMessage, 'error');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-page">
      <header className="upload-header">
        <h1 className="upload-title">Upload Data</h1>
        <p className="upload-subtitle">Import student data from CSV files for AI predictions</p>
        <a 
          href="/sample_prediction_data.csv" 
          download="sample_prediction_data.csv"
          className="upload-sample-btn"
        >
          📥 Download Sample CSV
        </a>
      </header>

      <div className="upload-content">
        <div className="upload-card">
          <div
            className={`upload-dropzone ${dragActive ? 'upload-dropzone-active' : ''} ${uploading ? 'upload-dropzone-uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            
            <div className="upload-dropzone-content">
              <span className="upload-icon">
                {uploading ? '⏳' : '📤'}
              </span>
              <h2 className="upload-dropzone-title">
                {uploading ? 'Uploading...' : 'Drop your CSV file here'}
              </h2>
              <p className="upload-dropzone-text">
                {uploading ? 'Please wait while we process your file' : 'or click the button below to browse'}
              </p>
              <button
                type="button"
                className="upload-button"
                onClick={handleButtonClick}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Choose CSV File'}
              </button>
            </div>
          </div>

          <div className="upload-info">
            <h3 className="upload-info-title">📋 Required Columns</h3>
            <ul className="upload-info-list">
              <li><strong>student_id</strong> - Unique identifier for each student</li>
              <li><strong>attendance</strong> - Attendance percentage (0-100)</li>
              <li><strong>internal_marks</strong> - Internal assessment marks</li>
              <li><strong>assignment_marks</strong> - Assignment scores</li>
              <li><strong>previous_gpa</strong> - Previous semester GPA</li>
              <li><strong>pass</strong> - Binary column (use 0 for all rows)</li>
              <li>Other performance metrics (optional)</li>
            </ul>
            <p className="upload-info-note">
              ℹ️ The 'pass' column is required by the system but you can set all values to 0. The AI will generate actual predictions!
            </p>
          </div>

          <div className="upload-tips">
            <h3 className="upload-tips-title">💡 Tips</h3>
            <ul className="upload-tips-list">
              <li>File format: CSV (.csv), Maximum size: 10MB</li>
              <li>Ensure your CSV has headers in the first row</li>
              <li>Remove any empty rows or columns</li>
              <li>Use consistent data formats (e.g., numbers for marks)</li>
              <li>After upload, check the Students page to verify predictions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
