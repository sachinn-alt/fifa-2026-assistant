import React, { useState } from 'react';
import { generateAIResponse, translateVolunteerDispatch } from '../services/aiService';
import InteractiveStadiumMap from './InteractiveStadiumMap';
import './Dashboard.css';

const VOLUNTEERS_DB = [
  { name: 'Carlos Gomez', langName: 'Spanish', langCode: 'es', location: 'Block 104', status: 'Available' },
  { name: 'Jean Depont', langName: 'French', langCode: 'fr', location: 'Gate A', status: 'On Duty' },
  { name: 'Fatima Al-Sayed', langName: 'Arabic', langCode: 'ar', location: 'Sector 202', status: 'Available' }
];

const PHASE_PREDICTIONS = {
  'pre-match': {
    crowdDensity: '84%',
    bottlenecks: 'Gate C (High), Gate A (Medium)',
    aiAdvice: 'GenAI Recommendation: Spectator arrival is peaking. Activate detour boards at South Lot to redirect flows toward Gate B. Open Gate C secondary turnstiles immediately.'
  },
  'kick-off': {
    crowdDensity: '98%',
    bottlenecks: 'Concessions (Low)',
    aiAdvice: 'GenAI Recommendation: Seating complete. Relocate 15 outer-ring volunteers to internal aisles. Prepare sanitation teams near Sector 104 for anticipated food runs.'
  },
  'halftime': {
    crowdDensity: '95%',
    bottlenecks: 'Gate B Restrooms (High), Block 104 Food (High)',
    aiAdvice: 'GenAI Recommendation: Halftime peak. Activate bathroom detour signage. Direct Sector 202 volunteers to manage food court queues and maintain emergency paths.'
  },
  'post-match': {
    crowdDensity: '92%',
    bottlenecks: 'Metro Entrance (Critical), Gate B Exit (High)',
    aiAdvice: 'GenAI Recommendation: Match ended. Synchronize exit lights. Request transit control to hold trains at 3-minute intervals. Dispatch crowd control units to Metro Gate.'
  }
};

const PRESET_MESSAGES = [
  "Medical response team to Gate A immediately",
  "Sanitation staff needed at Block 104 for spill cleanup",
  "Crowd control volunteers, please redirect flow from Metro Gate",
  "Assistance required for a wheelchair fan at Block 202 elevator"
];

const Dashboard = () => {
  const [simulationPhase, setSimulationPhase] = useState('pre-match');
  const [incidentReport, setIncidentReport] = useState('');
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      category: 'MAINTENANCE',
      severity: 'LOW',
      location: 'SECTOR 308',
      action: 'Sanitation Crew assigned to SECTOR 308 for cleanup and hazard control. Safety cone marking requested.',
      timestamp: '07:15 PM',
      resolved: false
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Volunteer Dispatch State
  const [selectedVolunteerIdx, setSelectedVolunteerIdx] = useState(0);
  const [dispatchText, setDispatchText] = useState(PRESET_MESSAGES[0]);
  const [isCustomMessage, setIsCustomMessage] = useState(false);
  const [customDispatchText, setCustomDispatchText] = useState('');
  const [dispatchedTask, setDispatchedTask] = useState(null);

  const activeAlertsCount = incidents.filter(inc => !inc.resolved).length;

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!incidentReport.trim()) return;

    setIsProcessing(true);
    // Calls aiService parser
    const parsedData = await generateAIResponse(incidentReport, 'staff');
    
    const newIncident = {
      id: Date.now(),
      category: parsedData.category,
      severity: parsedData.severity,
      location: parsedData.location,
      action: parsedData.action,
      timestamp: parsedData.timestamp,
      resolved: false
    };

    setIncidents(prev => [newIncident, ...prev]);
    setIsProcessing(false);
    setIncidentReport('');
  };

  const toggleIncidentResolve = (id) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, resolved: !inc.resolved } : inc
    ));
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    const volunteer = VOLUNTEERS_DB[selectedVolunteerIdx];
    const finalEnglishMsg = isCustomMessage ? customDispatchText : dispatchText;

    if (!finalEnglishMsg.trim()) return;

    const translatedMsg = translateVolunteerDispatch(finalEnglishMsg, volunteer.langCode);

    setDispatchedTask({
      volunteerName: volunteer.name,
      language: volunteer.langName,
      englishMsg: finalEnglishMsg,
      translatedMsg: translatedMsg,
      location: volunteer.location,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (isCustomMessage) setCustomDispatchText('');
  };

  // Get dynamic transit description for Option C
  const getTransitStatus = () => {
    switch (simulationPhase) {
      case 'pre-match': return '🚌 Inbound Peak';
      case 'kick-off': return '🟢 Flow Optimal';
      case 'halftime': return '🟡 Concourse Peak';
      case 'post-match': return '🔴 Outflow Critical (Metro Hold)';
      default: return '🟢 Flow Optimal';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Operational Intelligence Dashboard</h2>
          <p className="subtitle">FIFA 2026 Live Stadium Command Hub</p>
        </div>
        <span className="live-badge">
          <span className="pulse"></span> LIVE OPERATIONS
        </span>
      </div>

      {/* Option C: Top Metrics summary bar */}
      <div className="top-stats-counters-bar">
        <div className="stat-counter-card glass-panel">
          <span className="card-label">Stadium Attendance</span>
          <span className="card-value">68,450 / 70,000 <span className="pct">97.7%</span></span>
        </div>
        <div className={`stat-counter-card glass-panel ${activeAlertsCount > 0 ? 'alarm-active' : ''}`}>
          <span className="card-label">Active Incidents</span>
          <span className="card-value">
            {activeAlertsCount} Alerts {activeAlertsCount > 0 && <span className="warning-alarm-dot"></span>}
          </span>
        </div>
        <div className="stat-counter-card glass-panel">
          <span className="card-label">Volunteer Fleet</span>
          <span className="card-value">35 Active <span className="fleet-sub">12 Dispatched</span></span>
        </div>
        <div className="stat-counter-card glass-panel">
          <span className="card-label">Transit Network</span>
          <span className="card-value">{getTransitStatus()}</span>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* Left Column: Predictions, Heatmaps and Interactive Stadium Map */}
        <div className="operations-panel">
          
          {/* Phase Predictor Controller */}
          <div className="glass-panel analytics-control-card">
            <div className="control-header">
              <h4>Predictive Crowd Flow Analytics</h4>
              <div className="phase-buttons">
                {Object.keys(PHASE_PREDICTIONS).map((phase) => (
                  <button 
                    key={phase} 
                    className={`phase-btn ${simulationPhase === phase ? 'active' : ''}`}
                    onClick={() => setSimulationPhase(phase)}
                  >
                    {phase.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <span className="label">Predicted Load</span>
                <span className="value">{PHASE_PREDICTIONS[simulationPhase].crowdDensity}</span>
              </div>
              <div className="stat-box">
                <span className="label">Key Bottlenecks</span>
                <span className="value warning-text">{PHASE_PREDICTIONS[simulationPhase].bottlenecks}</span>
              </div>
            </div>

            <div className="ai-advice-container">
              <div className="ai-advice-header">
                <span className="ai-tag">GenAI COGNITIVE OUTLOOK</span>
              </div>
              <p>{PHASE_PREDICTIONS[simulationPhase].aiAdvice}</p>
            </div>
          </div>

          {/* Interactive Map */}
          <InteractiveStadiumMap 
            mode="staff" 
            simulationPhase={simulationPhase}
            activeIncidents={incidents.filter(inc => !inc.resolved)}
          />
        </div>

        {/* Right Column: Incident reporting & Volunteer coordination */}
        <div className="incident-dispatch-panel">
          
          {/* AI Incident Parser */}
          <div className="glass-panel incident-card">
            <h4>AI-Powered Incident Dispatcher</h4>
            <p className="description-text">Log unstructured reports. The AI categorizes, locates, determines severity, and generates emergency checklists instantly.</p>
            
            <form className="incident-form" onSubmit={handleReportSubmit}>
              <textarea 
                placeholder="Type incident report (e.g. 'A spectator in Block 202 has chest pains and needs a medic')" 
                value={incidentReport}
                onChange={(e) => setIncidentReport(e.target.value)}
                disabled={isProcessing}
                required
              ></textarea>
              <button type="submit" className="submit-btn" disabled={!incidentReport.trim() || isProcessing}>
                {isProcessing ? 'AI Processing & Dispatching...' : 'Log & Dispatch Incident'}
              </button>
            </form>

            <div className="incidents-history-list">
              <h5>Active Incidents ({incidents.filter(i => !i.resolved).length})</h5>
              {incidents.length === 0 ? (
                <p className="empty-text">No reports logged.</p>
              ) : (
                <div className="logs-container">
                  {incidents.map((inc) => (
                    <div 
                      key={inc.id} 
                      className={`analysis-result ${inc.resolved ? 'resolved' : inc.severity.toLowerCase()}`}
                    >
                      <div className="result-header">
                        <span className="badge category-badge">{inc.category}</span>
                        <span className={`badge severity-badge ${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                        <span className="location-text">📍 {inc.location}</span>
                      </div>
                      <p className="raw-text">"{inc.raw || 'Simulated Event'}"</p>
                      <div className="action-plan">
                        <strong>AI Checklist: </strong> {inc.action}
                      </div>
                      <div className="result-footer">
                        <span className="time">{inc.timestamp}</span>
                        <button 
                          onClick={() => toggleIncidentResolve(inc.id)}
                          className="resolve-btn"
                        >
                          {inc.resolved ? 'Re-open' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Multilingual Volunteer Dispatch Hub */}
          <div className="glass-panel volunteer-dispatch-card">
            <h4>Multilingual Dispatch Hub</h4>
            <p className="description-text">Send instructions to staff. The AI matches their language and auto-translates instructions instantly.</p>

            <form onSubmit={handleDispatchSubmit} className="dispatch-form">
              <div className="form-group">
                <label>Select Active Volunteer</label>
                <select 
                  value={selectedVolunteerIdx} 
                  onChange={(e) => setSelectedVolunteerIdx(parseInt(e.target.value))}
                  className="dispatch-select"
                >
                  {VOLUNTEERS_DB.map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.name} ({v.langName} - {v.location}) - {v.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group toggle-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={isCustomMessage} 
                    onChange={(e) => setIsCustomMessage(e.target.checked)}
                  />
                  Type custom message (simulated translation fallback)
                </label>
              </div>

              <div className="form-group">
                <label>Message to Send (English)</label>
                {isCustomMessage ? (
                  <input 
                    type="text" 
                    placeholder="Enter custom instruction..."
                    value={customDispatchText}
                    onChange={(e) => setCustomDispatchText(e.target.value)}
                    className="dispatch-input-text"
                    required
                  />
                ) : (
                  <select 
                    value={dispatchText} 
                    onChange={(e) => setDispatchText(e.target.value)}
                    className="dispatch-select"
                  >
                    {PRESET_MESSAGES.map((msg, idx) => (
                      <option key={idx} value={msg}>{msg}</option>
                    ))}
                  </select>
                )}
              </div>

              <button type="submit" className="dispatch-btn">
                📡 Translate & Send Dispatch
              </button>
            </form>

            {dispatchedTask && (
              <div className="dispatch-result-box">
                <div className="dispatch-result-header">
                  <span className="dispatch-badge">TRANSLATION SENT</span>
                  <span className="dispatch-time">{dispatchedTask.timestamp}</span>
                </div>
                <div className="dispatch-result-body">
                  <p><strong>To Volunteer:</strong> {dispatchedTask.volunteerName} ({dispatchedTask.location})</p>
                  <p><strong>Original (EN):</strong> "{dispatchedTask.englishMsg}"</p>
                  <p className="translated-msg"><strong>Translated ({dispatchedTask.language}):</strong> "{dispatchedTask.translatedMsg}"</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
