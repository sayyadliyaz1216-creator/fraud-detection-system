import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Send, 
  AlertTriangle, 
  FileText, 
  LogOut, 
  UserCheck 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, onLogout, alertCount = 0 }) {
  return (
    <header className="navbar">
      <div 
        className="nav-brand" 
        onClick={() => setActivePage('dashboard')}
        id="nav-brand-logo"
      >
        <div className="brand-icon-wrap">
          <ShieldAlert size={22} />
        </div>
        <div>
          <span className="brand-title">SentinelShield</span>
          <span className="brand-badge">AI Fraud Net</span>
        </div>
      </div>

      <nav className="nav-links">
        <button 
          id="nav-btn-dashboard"
          className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </button>

        <button 
          id="nav-btn-transactions"
          className={`nav-btn ${activePage === 'transactions' ? 'active' : ''}`}
          onClick={() => setActivePage('transactions')}
        >
          <Send size={17} />
          <span>Submit Transaction</span>
        </button>

        <button 
          id="nav-btn-alerts"
          className={`nav-btn ${activePage === 'alerts' ? 'active' : ''}`}
          onClick={() => setActivePage('alerts')}
        >
          <AlertTriangle size={17} />
          <span>Alerts</span>
          {alertCount > 0 && (
            <span className="nav-alert-pill" id="nav-alert-badge">{alertCount}</span>
          )}
        </button>

        <button 
          id="nav-btn-cases"
          className={`nav-btn ${activePage === 'cases' ? 'active' : ''}`}
          onClick={() => setActivePage('cases')}
        >
          <FileText size={17} />
          <span>Fraud Cases</span>
        </button>
      </nav>

      <div className="nav-user">
        <div className="user-tag">
          <span className="user-name" id="user-display-name">{user?.full_name || user?.username || 'Analyst'}</span>
          <span className="user-role">{user?.role || 'Security Officer'}</span>
        </div>
        <button 
          id="nav-btn-logout"
          className="logout-btn" 
          onClick={onLogout}
          title="Sign out"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
