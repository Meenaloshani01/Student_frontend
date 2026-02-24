import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import StudentDetail from './pages/StudentDetail';
import Advisor from './pages/Advisor';
import Students from './pages/Students';
import Predictions from './pages/Predictions';
import AtRisk from './pages/AtRisk';
import Interventions from './pages/Interventions';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {isLandingPage ? (
        <main id="main-content" className="app-main-fullwidth" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </main>
      ) : (
        <div className="app-layout">
          <Sidebar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <div className="app-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/at-risk" element={<AtRisk />} />
                <Route path="/interventions" element={<Interventions />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/student/:id" element={<StudentDetail />} />
                <Route path="/advisor" element={<Advisor />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
