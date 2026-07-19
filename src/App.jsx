import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import ModeToggle from './components/ModeToggle';

function App() {
  const [mode, setMode] = useState('fan'); // 'fan' or 'staff'

  return (
    <div className={`app-container ${mode}-mode`}>
      <header className="app-header">
        <div className="logo">
          <span className="logo-accent">FIFA 2026</span> Nexus
        </div>
        <ModeToggle currentMode={mode} onToggle={setMode} />
      </header>

      <main className="app-main">
        {mode === 'fan' ? <ChatInterface /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;
