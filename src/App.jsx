import { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import ModeToggle from './components/ModeToggle';

function App() {
  const [mode, setMode] = useState('fan'); // 'fan' or 'staff'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus-theme') || 'dark';
  });

  // Manage theme mode resolution & system default listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const resolveAndApplyTheme = () => {
      let resolved = theme;
      if (theme === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    resolveAndApplyTheme();
    localStorage.setItem('nexus-theme', theme);

    // Event listener for OS preferred theme updates
    const listener = () => {
      if (theme === 'system') {
        resolveAndApplyTheme();
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [theme]);

  return (
    <div className={`app-container ${mode}-mode`}>
      <header className="app-header">
        <div className="logo">
          <span className="logo-accent">FIFA 2026</span> NEXUS
        </div>
        
        <div className="header-controls">
          {/* Theme Switcher Dropdown */}
          <div className="theme-selector-container">
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              className="theme-select-dropdown"
              aria-label="Select Theme Mode"
            >
              <option value="dark">🌙 Dark</option>
              <option value="light">☀️ Light</option>
              <option value="system">💻 System</option>
            </select>
          </div>

          <ModeToggle currentMode={mode} onToggle={setMode} />
        </div>
      </header>

      <main className="app-main">
        {mode === 'fan' ? <ChatInterface /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
