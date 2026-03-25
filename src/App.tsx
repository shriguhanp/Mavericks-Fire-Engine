import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Agent from './pages/Agent';
import Advisor from './pages/Advisor';
import History from './pages/History';
import useFireStore from './store/useFireStore';

export default function App() {
  const { theme } = useFireStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-slate-900 dark:bg-[#0A0A0A] dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-300">
        <Router>
          <div className="flex flex-col min-min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/agent" element={<Agent />} />
                <Route path="/advisor" element={<Advisor />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </div>
    </ErrorBoundary>
  );
}
