import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionPage from './pages/TransactionPage';
import AlertsPage from './pages/AlertsPage';
import CasesPage from './pages/CasesPage';

export default function App() {
  // Store user session in localStorage or start with default demo user
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fraud_detector_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      id: 1,
      username: 'admin',
      full_name: 'AI Security Officer',
      role: 'Chief Risk Officer',
      home_location: 'Mumbai'
    };
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [selectedCaseRef, setSelectedCaseRef] = useState(null);

  // Poll or fetch initial alert count from FastAPI backend
  const refreshAlertCount = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlertCount(data.length);
      }
    } catch (err) {
      // Backend may be starting up
    }
  };

  useEffect(() => {
    refreshAlertCount();
    const interval = setInterval(refreshAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('fraud_detector_user', JSON.stringify(userData));
    setActivePage('dashboard');
    refreshAlertCount();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fraud_detector_user');
  };

  const handleTransactionProcessed = (newTx) => {
    // If it was flagged, increment alert count immediately
    if (newTx.decision === 'REVIEW' || newTx.decision === 'BLOCK') {
      setAlertCount(prev => prev + 1);
    }
  };

  const handleSelectCaseFromAlert = (alertItem) => {
    setSelectedCaseRef(alertItem.case_ref || alertItem.transaction_ref);
    setActivePage('cases');
  };

  // If user is logged out, render the Login page
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={handleLogout}
        alertCount={alertCount}
      />

      <main>
        {activePage === 'dashboard' && (
          <DashboardPage setActivePage={setActivePage} />
        )}

        {activePage === 'transactions' && (
          <TransactionPage
            setActivePage={setActivePage}
            onTransactionProcessed={handleTransactionProcessed}
          />
        )}

        {activePage === 'alerts' && (
          <AlertsPage
            setActivePage={setActivePage}
            onSelectCase={handleSelectCaseFromAlert}
          />
        )}

        {activePage === 'cases' && (
          <CasesPage
            selectedCaseRef={selectedCaseRef}
          />
        )}
      </main>
    </div>
  );
}
