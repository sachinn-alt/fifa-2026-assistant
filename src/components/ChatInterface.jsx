import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse, generateMatchdayItinerary } from '../services/aiService';
import InteractiveStadiumMap from './InteractiveStadiumMap';
import './ChatInterface.css';

// SVG Football Icon Component to replace the generic AI robot emoji
const FootballIcon = () => (
  <svg 
    viewBox="0 0 512 512" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="32" 
    className="football-svg" 
    style={{ width: '22px', height: '22px', display: 'block' }}
  >
    <circle cx="256" cy="256" r="240" strokeWidth="32" />
    <polygon points="256 160 165 226 200 334 312 334 347 226" fill="currentColor" />
    <line x1="256" y1="16" x2="256" y2="160" />
    <line x1="28" y1="181" x2="165" y2="226" />
    <line x1="115" y1="448" x2="200" y2="334" />
    <line x1="397" y1="448" x2="312" y2="334" />
    <line x1="484" y1="181" x2="347" y2="226" />
  </svg>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Welcome to the FIFA 2026 Nexus! I'm your AI Concierge. I speak multiple languages. Ask me about concessions, navigation, sustainability, or accessibility!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const [userSector, setUserSector] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  
  // Feature 1: AI Itinerary Setup States
  const [arrivalMode, setArrivalMode] = useState('metro');
  const [accessibilityNeed, setAccessibilityNeed] = useState('none');
  const [foodPreference, setFoodPreference] = useState('any');
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const quickInquiries = [
    { label: '🌱 Green Transit', query: 'What is the greenest transport option to leave the stadium?' },
    { label: '🍔 Veg Food', query: 'Where is the nearest vegetarian food concession?' },
    { label: '♿ Accessible WC', query: 'Show me wheelchair accessible restrooms.' },
    { label: '🧩 Sensory Room', query: 'Where is the quiet sensory room located?' },
    { label: '🚇 Metro Schedule', query: 'When is the next Metro train leaving?' }
  ];

  const queueStatuses = [
    { name: 'Gate C Entry', status: 'critical', wait: '15 mins', key: 'GATE C' },
    { name: 'Sector 104 Food', status: 'warning', wait: '8 mins', key: '104' },
    { name: 'Gate B Restrooms', status: 'safe', wait: '2 mins', key: 'GATE B' },
    { name: 'Metro Platform', status: 'warning', wait: '12 mins', key: 'METRO' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognitionRef.current = rec;
    }
  }, []);

  // Set recognition language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
      const speechLocales = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', ar: 'ar-SA', ja: 'ja-JP' };
      recognitionRef.current.lang = speechLocales[language] || 'en-US';
    }
  }, [language]);

  // Handle system greeting translation on language change
  useEffect(() => {
    const greetings = {
      en: "Welcome to the FIFA 2026 Nexus! I'm your AI Concierge. I speak multiple languages. Ask me about concessions, navigation, sustainability, or accessibility!",
      es: "¡Bienvenido a FIFA 2026 Nexus! Soy tu conserje de IA. Hablo varios idiomas. ¡Pregúntame sobre comida, navegación, sustentabilidad o accesibilidad!",
      fr: "Bienvenue sur FIFA 2026 Nexus! Je suis votre concierge IA. Je parle plusieurs langues. Posez-moi des questions sur les concessions, l'accessibilité ou le transport!",
      ar: "مرحباً بكم في FIFA 2026 Nexus! أنا المساعد الذكي الخاص بك. يمكنني مساعدتك في العثور على الأطعمة، التنقل، الاستدامة، أو سهولة الوصول.",
      ja: "FIFA 2026 Nexusへようこそ！私はAIコンシェルジュです。飲食、ナビゲーション、環境への取り組み、アクセシビリティについてお尋ねください！"
    };

    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: greetings[language] || greetings.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Stop speaking if speaking
    stopSpeaking();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const aiResponseText = await generateAIResponse(userMsg.text, 'fan', language, userSector);

    const aiMsg = {
      id: Date.now() + 1,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSend(input);
    setInput('');
  };

  const handleQuickInquiry = (queryText) => {
    handleSend(queryText);
  };

  const handleQueueDetourRequest = () => {
    const queryText = "What is the fastest queue route for food concessions and restrooms right now?";
    handleSend(queryText);
  };

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech
  const startSpeaking = (msgText, msgId) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-Speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(msgText);
    const speechLocales = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', ar: 'ar-AE', ja: 'ja-JP' };
    utterance.lang = speechLocales[language] || 'en-US';
    
    utterance.onend = () => {
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    }
  };

  // Feature 1: Generate AI Personal Itinerary
  const handleGenerateItinerary = async () => {
    setIsGeneratingItinerary(true);
    
    // Auto-select sector based on concessions/accessibility preferences to trigger map navigation routing
    let resolvedSector = userSector || '101';
    if (foodPreference === 'veg') resolvedSector = '104';
    else if (foodPreference === 'halal') resolvedSector = '202';
    else if (accessibilityNeed === 'sensory') resolvedSector = '205';
    
    setUserSector(resolvedSector);

    const userQuery = `Generate my matchday itinerary plan arriving via ${arrivalMode.toUpperCase()} with ${accessibilityNeed.toUpperCase()} needs and ${foodPreference.toUpperCase()} food targets.`;
    
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const itineraryResult = await generateMatchdayItinerary(arrivalMode, accessibilityNeed, foodPreference, resolvedSector);

    const aiMsg = {
      id: Date.now() + 1,
      sender: 'ai',
      text: itineraryResult,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
    setIsGeneratingItinerary(false);
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <div className="fan-hub-grid">
      {/* Left side: AI Assistant */}
      <div className="chat-container glass-panel">
        <div className="chat-header">
          <div className="assistant-info">
            <div className="ai-avatar">
              <FootballIcon />
            </div>
            <div>
              <h3>AI Concierge</h3>
              <span className="subtitle">FIFA 2026 Nexus Companion</span>
            </div>
          </div>
          
          <div className="language-selector">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select Language"
            >
              <option value="en">English (EN)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
              <option value="ar">العربية (AR)</option>
              <option value="ja">日本語 (JA)</option>
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender} ${speakingMsgId === msg.id ? 'active-speaking' : ''}`}>
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                <div className="bubble-footer">
                  <span className="message-time">{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button 
                      onClick={() => startSpeaking(msg.text, msg.id)}
                      className={`speech-speaker-btn ${speakingMsgId === msg.id ? 'speaking' : ''}`}
                      title={speakingMsgId === msg.id ? "Stop Speaking" : "Read Aloud"}
                      aria-label="Read Aloud"
                    >
                      {speakingMsgId === msg.id ? (
                        // Stop Speaker symbol or simple waveform
                        <svg className="speaking-wave" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="6" y1="4" x2="6" y2="20"></line>
                          <line x1="12" y1="9" x2="12" y2="15"></line>
                          <line x1="18" y1="6" x2="18" y2="18"></line>
                        </svg>
                      ) : (
                        // Standard Speaker Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper ai">
              <div className="message-bubble ai typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick inquiries pills */}
        <div className="quick-inquiries-scroll">
          {quickInquiries.map((inq, index) => (
            <button 
              key={index} 
              className="quick-pill" 
              onClick={() => handleQuickInquiry(inq.query)}
              disabled={isTyping}
            >
              {inq.label}
            </button>
          ))}
        </div>

        {/* Chat Input form */}
        <form className="chat-input-form" onSubmit={handleFormSubmit}>
          <button 
            type="button" 
            onClick={toggleListening} 
            className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
            title={isListening ? "Listening... Click to stop" : "Speak your question"}
            aria-label="Speak your question"
          >
            {isListening ? (
              <span className="mic-pulsing"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            )}
          </button>
          <input 
            type="text" 
            placeholder={isListening ? "Listening to your voice..." : "Ask me anything (e.g. concessions, sustainability)..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="chat-input"
            disabled={isTyping}
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim() || isTyping}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>

      {/* Right side: Map and Smart Details */}
      <div className="details-panel-container">
        {/* Ticket Sector selector & Queue Tracker */}
        <div className="glass-panel selection-card">
          <div className="card-row">
            <div>
              <h4>Your Match Ticket</h4>
              <p className="description-text">Select your seating sector block for customized navigation guidance.</p>
            </div>
            <select 
              value={userSector}
              onChange={(e) => setUserSector(e.target.value)}
              className="sector-select-dropdown"
              aria-label="Select Seating Block"
            >
              <option value="">-- Choose Block --</option>
              <option value="101">Block 101 (West)</option>
              <option value="104">Block 104 (South - Veg)</option>
              <option value="105">Block 105 (East)</option>
              <option value="202">Block 202 (North - Halal)</option>
              <option value="205">Block 205 (Sensory)</option>
              <option value="308">Block 308 (North West)</option>
            </select>
          </div>

          <div className="queue-tracker-section">
            <div className="section-title-row">
              <h5>Live Queue Status</h5>
              <button 
                onClick={handleQueueDetourRequest} 
                className="detour-request-btn"
                disabled={isTyping}
              >
                ⚡ Get Smart Detour
              </button>
            </div>
            <div className="queues-list">
              {queueStatuses.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`queue-item ${userSector === q.key ? 'highlighted-queue' : ''}`}
                  onClick={() => q.key && setUserSector(q.key)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="queue-name">
                    {q.name} {userSector === q.key && '🎯'}
                  </span>
                  <div className="queue-indicator-group">
                    <span className="queue-wait-time">{q.wait}</span>
                    <span className={`status-light ${q.status}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 1: AI Itinerary Builder */}
        <div className="glass-panel itinerary-card">
          <h4>AI Itinerary Builder</h4>
          <p className="description-text">Generate a step-by-step personalized matchday timeline plan.</p>
          
          <div className="itinerary-form-grid">
            <div className="itinerary-select-group">
              <label>Arrival Transit</label>
              <select value={arrivalMode} onChange={(e) => setArrivalMode(e.target.value)} className="itinerary-select">
                <option value="metro">🚇 Metro Line 2</option>
                <option value="shuttle">🚌 Shuttle Lot B</option>
                <option value="parking">🚗 Parking Lot A</option>
              </select>
            </div>
            <div className="itinerary-select-group">
              <label>Accessibility</label>
              <select value={accessibilityNeed} onChange={(e) => setAccessibilityNeed(e.target.value)} className="itinerary-select">
                <option value="none">🟢 Standard Entry</option>
                <option value="wheelchair">♿ Wheelchair Priority</option>
                <option value="sensory">🧩 Sensory Room Booking</option>
              </select>
            </div>
            <div className="itinerary-select-group">
              <label>Concession Target</label>
              <select value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)} className="itinerary-select">
                <option value="any">🍔 Any Concession</option>
                <option value="veg">🌱 Vegetarian Option</option>
                <option value="halal">🕌 Halal certified</option>
              </select>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGenerateItinerary} 
            className="itinerary-generate-btn"
            disabled={isGeneratingItinerary || isTyping}
          >
            {isGeneratingItinerary ? 'AI Planning...' : '📋 Generate AI Itinerary'}
          </button>
        </div>

        {/* Stadium Map */}
        <InteractiveStadiumMap 
          mode="fan" 
          selectedSector={userSector} 
          onSectorSelect={setUserSector}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
