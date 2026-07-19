import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/aiService';
import InteractiveStadiumMap from './InteractiveStadiumMap';
import './ChatInterface.css';

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
  const messagesEndRef = useRef(null);

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

  return (
    <div className="fan-hub-grid">
      {/* Left side: AI Assistant */}
      <div className="chat-container glass-panel">
        <div className="chat-header">
          <div className="assistant-info">
            <div className="ai-avatar">🤖</div>
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
              <div className={`message-bubble ${msg.sender}`}>
                <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                <span className="message-time">{msg.timestamp}</span>
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
          <input 
            type="text" 
            placeholder="Ask me anything (e.g. concessions, sustainability)..." 
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
