import React from 'react';
import './InteractiveStadiumMap.css';

const SECTOR_COORDS = {
  '101': { x: 75, y: 145, label: 'Sec 101' },
  '104': { x: 200, y: 225, label: 'Sec 104 (Veg Concession)' },
  '105': { x: 325, y: 145, label: 'Sec 105' },
  '202': { x: 200, y: 65, label: 'Sec 202 (Halal / Lift)' },
  '205': { x: 330, y: 70, label: 'Sec 205 (Sensory Room)' },
  '308': { x: 70, y: 70, label: 'Sec 308 (Halal)' },
  'GATE A': { x: 25, y: 145, label: 'Gate A (West Entry)' },
  'GATE B': { x: 375, y: 145, label: 'Gate B (East Restrooms)' },
  'GATE C': { x: 200, y: 20, label: 'Gate C (North Bottleneck)' },
  'METRO': { x: 200, y: 280, label: 'Metro Exit (South Transit)' }
};

const FACILITY_MARKERS = [
  { id: 'veg', x: 220, y: 235, color: '#00ff87', label: 'Green Pitch (Veg)', type: 'food' },
  { id: 'halal1', x: 225, y: 55, color: '#ffaa00', label: 'Hub Concessions (Halal)', type: 'food' },
  { id: 'halal2', x: 80, y: 80, color: '#ffaa00', label: 'Global Eats (Halal)', type: 'food' },
  { id: 'toilet1', x: 355, y: 155, color: '#00d0ff', label: 'Restrooms Gate B', type: 'toilet' },
  { id: 'toilet_acc1', x: 90, y: 155, color: '#0055ff', label: 'Wheelchair WC Sec 104', type: 'accessible' },
  { id: 'toilet_acc2', x: 215, y: 75, color: '#0055ff', label: 'Wheelchair WC Sec 202', type: 'accessible' },
  { id: 'sensory_room', x: 345, y: 55, color: '#9d00ff', label: 'Sensory Room Sec 205', type: 'sensory' }
];

// Pre-defined guidance routes from blocks to nearest target facilities
const NAVIGATION_ROUTES = {
  '104': { x1: 200, y1: 225, x2: 220, y2: 235, color: '#00ff87', label: 'Path to Veg Food Concession' },
  '202': { x1: 200, y1: 65, x2: 225, y2: 55, color: '#ffaa00', label: 'Path to Halal Concession' },
  '205': { x1: 330, y1: 70, x2: 345, y2: 55, color: '#9d00ff', label: 'Path to sensory quiet room' },
  '308': { x1: 70, y1: 70, x2: 80, y2: 80, color: '#ffaa00', label: 'Path to Halal Concession' },
  'GATE B': { x1: 375, y1: 145, x2: 355, y2: 155, color: '#00d0ff', label: 'Path to Gate B Restrooms' }
};

const InteractiveStadiumMap = ({ 
  mode = 'fan', 
  selectedSector = '', 
  onSectorSelect = null, 
  simulationPhase = 'pre-match', 
  activeIncidents = [],
  sentimentComments = []
}) => {

  // Dynamic Heatmap Zones based on Simulation Phase (Staff Mode)
  const getHeatmapZones = () => {
    if (mode !== 'staff') return [];
    
    switch (simulationPhase) {
      case 'pre-match':
        return [
          { x: 200, y: 20, r: 40, intensity: 'high', label: 'Gate C Bottleneck' },
          { x: 25, y: 145, r: 30, intensity: 'medium', label: 'Gate A Entry flow' },
          { x: 200, y: 280, r: 45, intensity: 'medium', label: 'Metro Arrival' }
        ];
      case 'kick-off':
        return [
          { x: 200, y: 145, r: 25, intensity: 'low', label: 'Pitch Ceremony' },
          { x: 220, y: 235, r: 35, intensity: 'medium', label: 'Concession rush' }
        ];
      case 'halftime':
        return [
          { x: 355, y: 155, r: 45, intensity: 'high', label: 'Gate B Restroom queue' },
          { x: 220, y: 235, r: 40, intensity: 'high', label: 'Block 104 Food queue' },
          { x: 225, y: 55, r: 35, intensity: 'medium', label: 'Block 202 Food queue' }
        ];
      case 'post-match':
        return [
          { x: 200, y: 280, r: 55, intensity: 'high', label: 'Metro exit congestion' },
          { x: 375, y: 145, r: 40, intensity: 'high', label: 'Gate B exit flow' },
          { x: 25, y: 145, r: 35, intensity: 'medium', label: 'Gate A exit flow' }
        ];
      default:
        return [];
    }
  };

  const heatmapZones = getHeatmapZones();
  
  // Find active route if selected sector has navigation path defined
  const activeRoute = mode === 'fan' && selectedSector ? NAVIGATION_ROUTES[selectedSector.toUpperCase()] : null;

  return (
    <div className="stadium-map-wrapper glass-panel">
      <div className="map-header">
        <h4>{mode === 'fan' ? 'Interactive Stadium Map' : 'Real-time Crowd Analytics Map'}</h4>
        <span className="map-legend">
          {mode === 'fan' ? (
            <>
              <span className="legend-item"><span className="dot veg"></span> Veg</span>
              <span className="legend-item"><span className="dot halal"></span> Halal</span>
              <span className="legend-item"><span className="dot toilet"></span> WC</span>
              <span className="legend-item"><span className="dot wheelchair"></span> ♿ WC</span>
              <span className="legend-item"><span className="dot sensory"></span> Sensory</span>
            </>
          ) : (
            <>
              <span className="legend-item"><span className="dot heat-high"></span> Heavy</span>
              <span className="legend-item"><span className="dot heat-med"></span> Moderate</span>
              <span className="legend-item"><span className="dot heat-low"></span> Normal</span>
            </>
          )}
        </span>
      </div>

      <div className="svg-container">
        <svg viewBox="0 0 400 300" className="stadium-svg">
          {/* Defs for Glows and Gradients */}
          <defs>
            <radialGradient id="high-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff0055" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ff0055" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="med-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="low-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff87" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="incident-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff0000" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="route-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff87" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
            </radialGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Outer Ring / Boundary */}
          <rect x="10" y="10" width="380" height="280" rx="30" className="outer-boundary" />

          {/* Middle Concourse ring path */}
          <rect x="50" y="50" width="300" height="200" rx="20" className="concourse-ring" />

          {/* Field/Pitch */}
          <g filter="url(#shadow)">
            <rect x="125" y="95" width="150" height="110" rx="8" className="pitch-base" />
            <rect x="135" y="105" width="130" height="90" className="pitch-grass" />
            {/* Center line and circle */}
            <line x1="200" y1="105" x2="200" y2="195" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="200" cy="150" r="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <rect x="135" y="130" width="15" height="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <rect x="250" y="130" width="15" height="40" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </g>

          {/* Sectors */}
          {Object.entries(SECTOR_COORDS).map(([key, coord]) => {
            const isSelected = selectedSector.toUpperCase() === key.toUpperCase();
            const isGate = key.startsWith('GATE') || key === 'METRO';

            // Check if there is active frustrated sentiment feedback for this block
            const hasFrustration = mode === 'staff' && sentimentComments.some(c => 
              c.sentiment === 'FRUSTRATED' && c.location.toUpperCase().includes(key.toUpperCase())
            );

            return (
              <g 
                key={key} 
                className={`sector-group ${isSelected ? 'selected' : ''} ${isGate ? 'gate' : ''} ${hasFrustration ? 'frustrated-sentiment-sector' : ''}`}
                onClick={() => onSectorSelect && onSectorSelect(key)}
              >
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r={isGate ? 18 : 22} 
                  className="sector-bg" 
                />
                <text 
                  x={coord.x} 
                  y={coord.y + 4} 
                  className="sector-text"
                >
                  {key}
                </text>
                <title>{coord.label}</title>
              </g>
            );
          })}

          {/* Crowd Heatmaps (Staff Mode) */}
          {mode === 'staff' && heatmapZones.map((zone, idx) => (
            <g key={`heat-${idx}`} className="heatmap-element">
              <circle 
                cx={zone.x} 
                cy={zone.y} 
                r={zone.r} 
                fill={`url(#${zone.intensity}-glow)`} 
                className="pulse-glow"
              />
              <circle 
                cx={zone.x} 
                cy={zone.y} 
                r={3} 
                fill={zone.intensity === 'high' ? '#ff0055' : zone.intensity === 'medium' ? '#ffaa00' : '#00ff87'} 
              />
            </g>
          ))}

          {/* Active Incidents (Staff Mode) */}
          {mode === 'staff' && activeIncidents.map((incident, idx) => {
            // Match incident location to coordinates
            const locKey = Object.keys(SECTOR_COORDS).find(k => 
              incident.location.toUpperCase().includes(k.toUpperCase())
            );
            if (!locKey) return null;
            const coord = SECTOR_COORDS[locKey];

            return (
              <g key={`incident-map-${idx}`} className="map-incident-marker">
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r={35} 
                  fill="url(#incident-glow)"
                  className="incident-pulse"
                />
                {/* Warning triangle icon */}
                <path 
                  d={`M ${coord.x} ${coord.y - 12} L ${coord.x - 10} ${coord.y + 6} L ${coord.x + 10} ${coord.y + 6} Z`} 
                  fill="#ff0055" 
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text x={coord.x} y={coord.y + 4} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">!</text>
                <title>Incident: {incident.category} ({incident.severity})</title>
              </g>
            );
          })}

          {/* Holographic Routing Line (Fan Mode Option B) */}
          {activeRoute && (
            <g className="map-route-guidance">
              {/* Outer Glow Line */}
              <line 
                x1={activeRoute.x1} 
                y1={activeRoute.y1} 
                x2={activeRoute.x2} 
                y2={activeRoute.y2} 
                stroke={activeRoute.color} 
                strokeWidth="6" 
                strokeLinecap="round"
                opacity="0.3"
                className="route-glow-line"
              />
              {/* Core Moving Dotted Line */}
              <line 
                x1={activeRoute.x1} 
                y1={activeRoute.y1} 
                x2={activeRoute.x2} 
                y2={activeRoute.y2} 
                stroke={activeRoute.color} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeDasharray="6 4"
                className="route-dash-line"
              />
              {/* Pulse at the target facility */}
              <circle 
                cx={activeRoute.x2} 
                cy={activeRoute.y2} 
                r={10} 
                fill="none" 
                stroke={activeRoute.color} 
                strokeWidth="1.5" 
                className="route-ping-pulse"
              />
              <circle 
                cx={activeRoute.x2} 
                cy={activeRoute.y2} 
                r={3} 
                fill={activeRoute.color} 
              />
            </g>
          )}

          {/* Fan Facilities Markers (Fan Mode) */}
          {mode === 'fan' && FACILITY_MARKERS.map((facility) => {
            const highlight = selectedSector === '104' && facility.id === 'veg' ||
                              selectedSector === '202' && facility.id === 'halal1' ||
                              selectedSector === '308' && facility.id === 'halal2' ||
                              selectedSector === '104' && facility.id === 'toilet_acc1' ||
                              selectedSector === '202' && facility.id === 'toilet_acc2' ||
                              selectedSector === '205' && facility.id === 'sensory_room' ||
                              selectedSector === 'GATE B' && facility.id === 'toilet1';

            return (
              <g 
                key={facility.id} 
                className={`facility-marker ${highlight ? 'highlighted' : ''}`}
              >
                <circle 
                  cx={facility.x} 
                  cy={facility.y} 
                  r={highlight ? 8 : 5} 
                  fill={facility.color} 
                  className="facility-dot"
                />
                {highlight && (
                  <circle 
                    cx={facility.x} 
                    cy={facility.y} 
                    r={16} 
                    fill="none" 
                    stroke={facility.color} 
                    strokeWidth="1.5" 
                    className="facility-pulse"
                  />
                )}
                <title>{facility.label}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="map-footer">
        <p className="hint-text">
          {mode === 'fan' 
            ? activeRoute 
              ? `🗺️ Holographic Path Active: ${activeRoute.label}.`
              : '💡 Select a sector block in the list or click on the map to find nearby concessions, wheelchair WCs, and sensory rooms.' 
            : `📈 Heatmap displaying crowd density for Phase: "${simulationPhase.replace('-', ' ').toUpperCase()}".`
          }
        </p>
      </div>
    </div>
  );
};

export default InteractiveStadiumMap;
