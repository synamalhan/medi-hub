import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useDataStore } from './stores/dataStore';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PatientSimulator from './pages/PatientSimulator';
import Flashcards from './pages/Flashcards';
import Deadlines from './pages/Deadlines';
import Mnemonics from './pages/Mnemonics';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import ResearchSummarizer from './pages/ResearchSummarizer';

function App() {
  const { isAuthenticated, initialize } = useAuthStore();
  const { loadAllData } = useDataStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, loadAllData]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/auth" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simulator" element={<PatientSimulator />} />
          <Route path="flashcards" element={<Flashcards />} />
          <Route path="deadlines" element={<Deadlines />} />
          <Route path="mnemonics" element={<Mnemonics />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="research-summarizer" element={<ResearchSummarizer />} />
        </Route>
        
        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
}

export default App;