import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import Advisor from './pages/Advisor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="app-layout">
          <Sidebar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <div className="app-content">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student/:id" element={<StudentDetail />} />
                <Route path="/advisor" element={<Advisor />} />
              </Routes>
            </div>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
