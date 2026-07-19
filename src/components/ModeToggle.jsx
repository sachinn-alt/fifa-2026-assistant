import React from 'react';
import './ModeToggle.css';

const ModeToggle = ({ currentMode, onToggle }) => {
  return (
    <div className="toggle-container">
      <span className={`toggle-label ${currentMode === 'fan' ? 'active' : ''}`}>Fan</span>
      <button 
        className={`toggle-btn ${currentMode}`}
        onClick={() => onToggle(currentMode === 'fan' ? 'staff' : 'fan')}
        aria-label="Toggle Persona Mode"
      >
        <div className="toggle-slider"></div>
      </button>
      <span className={`toggle-label ${currentMode === 'staff' ? 'active' : ''}`}>Staff</span>
    </div>
  );
};

export default ModeToggle;
