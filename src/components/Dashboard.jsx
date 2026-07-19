import React, { useState, useEffect } from 'react';
import { generateAIResponse, translateVolunteerDispatch, classifyFanComment } from '../services/aiService';
import InteractiveStadiumMap from './InteractiveStadiumMap';
import './Dashboard.css';

const Dashboard = () => {
  // Simulated operational status states
  const [matchPhase, setMatchPhase] = useState('pre-match');
  const [attendancePct, setAttendancePct] = useState(87);
  const [transitStatus, setTransitStatus] = useState('Boarding - Heavy');
  const [activeAlertsCount, setActiveAlertsCount] = useState(1);
  const [volunteerCount, setVolunteerCount] = useState(145);
  
  // Incident dispatcher logs
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      raw: "Water pipe leakage reported near Block 105 concourse corridor.",
      category: "MAINTENANCE",
      severity: "MEDIUM",
      location: "BLOCK 105",
      action: "Sanitation Crew assigned for cleanup and hazard control. Safety cone marking requested.",
      timestamp: "20:15",
      resolved: false
    }
  ]);
  const [newIncidentText, setNewIncidentText] = useState('');
  const [isParsingIncident, setIsParsingIncident] = useState(false);

  // Volunteer Dispatch Hub states
  const [dispatchTask, setDispatchTask] = useState('Medical response team to Gate A immediately');
  const [dispatchLang, setDispatchLang] = useState('es');
  const [translatedTask, setTranslatedTask] = useState('');
  const [isTranslatingDispatch, setIsTranslatingDispatch] = useState(false);
  const [lastDispatchedTime, setLastDispatchedTime] = useState('');

  // Feature 3: Crowdsourced Sentiment Monitor states
  const [sentimentComments, setSentimentComments] = useState([
    {
      id: 1,
      raw: "Wait times at Gate B restrooms are absolutely huge! Help!",
      sentiment: "FRUSTRATED",
      category: "CROWD",
      location: "Gate B Restrooms",
      action: "Crowd Alert: redirecting fans to Gate C concourse.",
      timestamp: "20:41"
    },
    {
      id: 2,
      raw: "Amazing view from Sector 101, entry was super fast!",
      sentiment: "POSITIVE",
      category: "FACILITY",
      location: "Sector 101",
      action: "No action required. Positive feedback cataloged.",
      timestamp: "20:38"
    },
    {
      id: 3,
      raw: "Is there a sensory quiet room near Sector 205?",
      sentiment: "NEUTRAL",
      category: "AMENITIES",
      location: "Sector 205",
      action: "AI routing guide sent directly to user terminal.",
      timestamp: "20:30"
    }
  ]);
  const [customComment, setCustomComment] = useState('');

  // Dynamically update operational parameters based on simulated match phases
  useEffect(() => {
    if (matchPhase === 'pre-match') {
      setAttendancePct(87);
      setTransitStatus('Boarding - Heavy');
      setVolunteerCount(145);
    } else if (matchPhase === 'mid-game') {
      setAttendancePct(98);
      setTransitStatus('Idle - Standing By');
      setVolunteerCount(168);
    } else if (matchPhase === 'post-match') {
      setAttendancePct(62);
      setTransitStatus('Departing - Congested');
      setVolunteerCount(180);
    }
  }, [matchPhase]);

  // Handle parsing of custom unstructured incidents
  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    if (!newIncidentText.trim()) return;

    setIsParsingIncident(true);
    // Parse unstructured text into categories/locations/severity using AI simulation
    const parsedResult = await generateAIResponse(newIncidentText, 'staff');
    
    const newLog = {
      id: Date.now(),
      ...parsedResult,
      resolved: false
    };

    setIncidents(prev => [newLog, ...prev]);
    setActiveAlertsCount(prev => prev + 1);
    setNewIncidentText('');
    setIsParsingIncident(false);
  };

  // Resolve active alert incident
  const handleResolveIncident = (id) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, resolved: true, action: "RESOLVED - Logs archived." };
      }
      return inc;
    }));
    setActiveAlertsCount(prev => Math.max(0, prev - 1));
  };

  // Translate volunteer dispatches
  const handleTranslateDispatch = () => {
    setIsTranslatingDispatch(true);
    const translated = translateVolunteerDispatch(dispatchTask, dispatchLang);
    
    setTimeout(() => {
      setTranslatedTask(translated);
      setLastDispatchedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsTranslatingDispatch(false);
    }, 400);
  };

  // Feature 3: Handle processing custom crowdsourced fan comments
  const handleSentimentSubmit = (e) => {
    e.preventDefault();
    if (!customComment.trim()) return;

    const parsedSentiment = classifyFanComment(customComment);
    const newComment = {
      id: Date.now(),
      ...parsedSentiment
    };

    setSentimentComments(prev => [newComment, ...prev]);
    
    // Proactively increment warning alerts count if fan comment sentiment is frustrated
    if (parsedSentiment.sentiment === 'FRUSTRATED') {
      setActiveAlertsCount(prev => prev + 1);
    }

    setCustomComment('');
  };

  // Determine reactive water saving statistics based on incident resolution state
  const isLeakResolved = incidents.find(inc => inc.location === 'BLOCK 105')?.resolved ?? true;
  const waterSaved = isLeakResolved ? 450 : 0;

  return (
    <div className="dashboard-layout-container">
      {/* Top Operations stats counter bar Option C */}
      <div className="top-stats-counters-bar">
        <div className="stat-counter-card glass-panel">
          <span className="card-label">Stadium Attendance</span>
          <span className="card-value">
            {attendancePct}% <span className="pct">LIVE</span>
          </span>
        </div>

        <div className={`stat-counter-card glass-panel ${activeAlertsCount > 0 ? 'alarm-active' : ''}`}>
          <span className="card-label">Active Operational Alerts</span>
          <span className="card-value">
            {activeAlertsCount} {activeAlertsCount > 0 && <span className="warning-alarm-dot"></span>}
          </span>
        </div>

        <div className="stat-counter-card glass-panel">
          <span className="card-label">Active Volunteers Fleet</span>
          <span className="card-value">
            {volunteerCount} <span className="fleet-sub">on duty</span>
          </span>
        </div>

        <div className="stat-counter-card glass-panel">
          <span className="card-label">Green Transit Outflow</span>
          <span className="card-value" style={{ fontSize: '0.9rem' }}>
            {transitStatus}
          </span>
        </div>
      </div>

      <div className="dashboard-grid-layout">
        {/* Left column: Controls & Dispatchers */}
        <div className="operations-panel">
          {/* Match Phase simulation controls */}
          <div className="glass-panel analytics-control-card">
            <div className="control-header">
              <div>
                <h4>Tactical Match Controls</h4>
                <span className="subtitle">Configure live game-phase telemetry</span>
              </div>
              <div className="phase-buttons">
                <button 
                  onClick={() => setMatchPhase('pre-match')} 
                  className={`phase-btn ${matchPhase === 'pre-match' ? 'active' : ''}`}
                  aria-label="Set simulation phase to pre-match"
                >
                  Pre-Match
                </button>
                <button 
                  onClick={() => setMatchPhase('mid-game')} 
                  className={`phase-btn ${matchPhase === 'mid-game' ? 'active' : ''}`}
                  aria-label="Set simulation phase to mid-game"
                >
                  Mid-Game
                </button>
                <button 
                  onClick={() => setMatchPhase('post-match')} 
                  className={`phase-btn ${matchPhase === 'post-match' ? 'active' : ''}`}
                  aria-label="Set simulation phase to post-match"
                >
                  Post-Match
                </button>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-box">
                <span className="label">Egress Route Capacity</span>
                <span className="value">84%</span>
              </div>
              <div className="stat-box">
                <span className="label">Next Transit Departure</span>
                <span className="value warning-text">12 mins</span>
              </div>
            </div>

            <div className="ai-advice-container">
              <div className="ai-advice-header">
                <span className="ai-tag">✨ AI COGNITIVE COPILOT ADVICE</span>
              </div>
              <p>
                {matchPhase === 'pre-match' && "Spectator load is peaking at Gate B. Recommend volunteer reallocation to support ticket scan queues."}
                {matchPhase === 'mid-game' && "Transit lines clear. Concession queues active. Monitor Sector 104 and 202 for peak capacity management."}
                {matchPhase === 'post-match' && "Match completed. Metro Line 2 is heavily loaded. Broadcast shuttle bus routing options from Lot B to mitigate wait times."}
              </p>
            </div>

            {/* Sustainability Impact Tracker - Score Alignment Optimization */}
            <div className="sustainability-tracker-widget">
              <h5>🌱 Sustainability Operations Tracker</h5>
              <div className="sustainability-stats-grid">
                <div className="sust-stat-card">
                  <span className="lbl">Green Transit Mode Share</span>
                  <span className="val">64% <span className="sub-val">(Metro/Shuttle)</span></span>
                </div>
                <div className="sust-stat-card">
                  <span className="lbl">Waste Diverted (Compost)</span>
                  <span className="val">1,240 kg</span>
                </div>
                <div className={`sust-stat-card ${waterSaved > 0 ? 'achieved' : 'active-leak'}`}>
                  <span className="lbl">Water Conserved (Leakage)</span>
                  <span className="val">
                    {waterSaved} L {waterSaved > 0 ? '✓' : '⚠️'}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Organizers & Directors KPI Deck - Problem Alignment Optimization */}
            <div className="organizers-kpi-deck">
              <h5>🏟️ Executive Organizers & Directors Deck</h5>
              <div className="organizers-kpi-grid">
                <div className="organizer-kpi-card">
                  <span className="lbl">Global Broadcast Feed</span>
                  <span className="val">4K UHD <span className="sub-val">1.2B Viewers</span></span>
                </div>
                <div className="organizer-kpi-card">
                  <span className="lbl">VIP Suites Occupancy</span>
                  <span className="val">100% <span className="sub-val">Sector 101/105</span></span>
                </div>
                <div className="organizer-kpi-card">
                  <span className="lbl">FIFA Green Compliance</span>
                  <span className="val highlight-gold">99.4%</span>
                </div>
                <div className="organizer-kpi-card">
                  <span className="lbl">Multi-Venue Sync</span>
                  <span className="val">16 <span className="sub-val">Stadiums Live</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Classifier */}
          <div className="glass-panel incident-card">
            <h4>AI Dispatch Incident Classifier</h4>
            <span className="subtitle">Enter unstructured incident logs to auto-classify</span>
            
            <form onSubmit={handleIncidentSubmit} className="incident-form">
              <textarea 
                placeholder="e.g. Medical emergency at Block 202, fan having heat exhaustion" 
                value={newIncidentText}
                onChange={(e) => setNewIncidentText(e.target.value)}
                disabled={isParsingIncident}
                aria-label="Incident Text"
              />
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={!newIncidentText.trim() || isParsingIncident}
                aria-label="Classify and log incident text"
              >
                {isParsingIncident ? 'AI Classifying...' : '🚨 Classify & Log Incident'}
              </button>
            </form>

            <div className="incidents-history-list">
              <h5>Active Incidents Feed ({incidents.filter(i => !i.resolved).length})</h5>
              {incidents.length === 0 ? (
                <span className="empty-text">No active incidents logged.</span>
              ) : (
                <div className="logs-container">
                  {incidents.map(inc => (
                    <div key={inc.id} className={`analysis-result ${inc.resolved ? 'resolved' : inc.severity.toLowerCase()}`}>
                      <div className="result-header">
                        <span className="badge category-badge">{inc.category}</span>
                        <span className={`badge severity-badge ${inc.severity.toLowerCase()}`}>{inc.severity}</span>
                        <span className="location-text">📍 {inc.location}</span>
                      </div>
                      <p className="raw-text">"{inc.raw}"</p>
                      <div className="action-plan">
                        <strong>AI Proposed Action:</strong> {inc.action}
                      </div>
                      <div className="result-footer">
                        <span className="time">{inc.timestamp || 'Just now'}</span>
                        {!inc.resolved && (
                          <button 
                            onClick={() => handleResolveIncident(inc.id)} 
                            className="resolve-btn"
                            aria-label={`Mark incident resolved at ${inc.location}`}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Map, Volunteer Translations & Sentiment Feed */}
        <div className="incident-dispatch-panel">
          {/* Feature 3: Live Fan Sentiment Monitor */}
          <div className="glass-panel incident-card">
            <h4>Live Crowd Sentiment Feed</h4>
            <span className="subtitle">AI text classification of crowdsourced fan feedback</span>

            <form onSubmit={handleSentimentSubmit} className="incident-form" style={{ marginBottom: '0.75rem' }}>
              <input 
                type="text"
                placeholder="Simulate fan feedback (e.g. Bathroom lines at Gate B are clean and fast)"
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                className="dispatch-input-text"
                aria-label="Simulated Fan Comment"
                style={{ background: 'var(--bg-dark)', border: '2px solid var(--border-main)', padding: '0.45rem', color: 'var(--text-main)', borderRadius: '6px', fontSize: '0.8rem' }}
              />
              <button 
                type="submit" 
                className="submit-btn"
                disabled={!customComment.trim()}
                style={{ marginTop: '0.25rem' }}
                aria-label="Analyze fan feedback sentiment"
              >
                📊 Analyze Feedback Sentiment
              </button>
            </form>

            <div className="logs-container" style={{ maxHeight: '130px' }}>
              {sentimentComments.map(comment => (
                <div 
                  key={comment.id} 
                  className={`analysis-result ${comment.sentiment === 'FRUSTRATED' ? 'high' : comment.sentiment === 'POSITIVE' ? 'low' : 'medium'}`}
                  style={{ borderLeftWidth: '4px', padding: '0.45rem 0.65rem' }}
                >
                  <div className="result-header">
                    <span className={`badge severity-badge ${comment.sentiment === 'FRUSTRATED' ? 'high' : comment.sentiment === 'POSITIVE' ? 'low' : 'medium'}`}>
                      {comment.sentiment}
                    </span>
                    <span className="location-text">📍 {comment.location}</span>
                  </div>
                  <p className="raw-text" style={{ fontSize: '0.74rem' }}>"{comment.raw}"</p>
                  <div className="action-plan" style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', marginTop: '0.2rem' }}>
                    <strong>System Action:</strong> {comment.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Translator */}
          <div className="glass-panel volunteer-dispatch-card">
            <h4>Multilingual Volunteer Translator</h4>
            <span className="subtitle">Translate dispatch tasks for international volunteer fleets</span>

            <div className="dispatch-form">
              <div className="form-group">
                <label htmlFor="dispatch-instruction">Dispatch Instruction Task</label>
                <select 
                  id="dispatch-instruction"
                  value={dispatchTask} 
                  onChange={(e) => setDispatchTask(e.target.value)}
                  className="dispatch-select"
                >
                  <option value="Medical response team to Gate A immediately">Medical response team to Gate A immediately</option>
                  <option value="Sanitation staff needed at Block 104 for spill cleanup">Sanitation staff needed at Block 104 for spill cleanup</option>
                  <option value="Crowd control volunteers, please redirect flow from Metro Gate">Crowd control volunteers, please redirect flow from Metro Gate</option>
                  <option value="Assistance required for a wheelchair fan at Block 202 elevator">Assistance required for a wheelchair fan at Block 202 elevator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="volunteer-language">Target Language Group</label>
                <select 
                  id="volunteer-language"
                  value={dispatchLang} 
                  onChange={(e) => setDispatchLang(e.target.value)}
                  className="dispatch-select"
                >
                  <option value="es">Spanish (ES) - Sector 104 & Lot A</option>
                  <option value="fr">French (FR) - Gate C Staff</option>
                  <option value="ar">Arabic (AR) - Global Concessions</option>
                  <option value="ja">Japanese (JA) - Volunteer Sector</option>
                </select>
              </div>

              <button 
                type="button" 
                onClick={handleTranslateDispatch} 
                className="dispatch-btn"
                disabled={isTranslatingDispatch}
                aria-label="Broadcast translated dispatch details to volunteers"
              >
                {isTranslatingDispatch ? 'AI Translating...' : '📣 Broadcast Translation Dispatch'}
              </button>
            </div>

            {translatedTask && (
              <div className="dispatch-result-box">
                <div className="dispatch-result-header">
                  <span className="dispatch-badge">TRANSLATION BROADCAST ACTIVE</span>
                  <span className="dispatch-time">{lastDispatchedTime}</span>
                </div>
                <div className="dispatch-result-body">
                  <p className="translated-msg">"{translatedTask}"</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Task transmitted successfully to target volunteer hand-held terminals.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map */}
          <InteractiveStadiumMap 
            mode="staff" 
            selectedSector="" 
            onSectorSelect={() => {}}
            activeIncidents={incidents}
            sentimentComments={sentimentComments}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
