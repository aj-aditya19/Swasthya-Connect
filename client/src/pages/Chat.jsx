import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/UI';

const QUICK = [
  'What does my latest report mean?',
  'Metformin ke side effects kya hain?',
  'Iron badhane ke liye kya khayein?',
  'When is my next follow-up?',
  'Blood sugar normal kaise karein?',
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { user }  = useAuth();
  const [sessionId]  = useState(() => localStorage.getItem('chatSessionId') || (() => { const id = uuidv4(); localStorage.setItem('chatSessionId', id); return id; })());
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [typing, setTyping]     = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    // Load session history
    chatAPI.getSession(sessionId).then(r => {
      const msgs = r.data.messages || [];
      if (msgs.length === 0) {
        setMessages([{ role: 'assistant', content: `Namaste ${user?.name?.split(' ')[0]}! 🙏 I am MediBot, your AI health assistant.\n\nMujhse apni sehat ke baare mein poochein — Hindi ya English mein. I can explain your medical reports, medicines, and give health advice based on your records.\n\nHow can I help you today?`, timestamp: new Date().toISOString() }]);
      } else {
        setMessages(msgs);
      }
    }).catch(() => {
      setMessages([{ role: 'assistant', content: 'Namaste! I am MediBot. How can I help you with your health today?', timestamp: new Date().toISOString() }]);
    });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput('');
    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    try {
      const res = await chatAPI.sendMessage({ message: msg, sessionId, language: user?.preferredLanguage || 'en' });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that right now. Please try again.', timestamp: new Date().toISOString() }]);
    } finally { setTyping(false); inputRef.current?.focus(); }
  };

  const newChat = async () => {
    if (!window.confirm('Start a new chat? Current conversation will be cleared.')) return;
    try { await chatAPI.clearSession(sessionId); } catch {}
    localStorage.removeItem('chatSessionId');
    window.location.reload();
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <div className="chat-wrap">
      <div className="chat-topbar">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>MediBot</span>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>Powered by Grok · Hindi & English</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={newChat}>New chat</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role} fade-in`}>
            <div className="msg-avatar">{msg.role === 'assistant' ? 'MB' : initials}</div>
            <div>
              <div className="msg-bubble">{msg.content}</div>
              <div className="msg-time">{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg msg-assistant fade-in">
            <div className="msg-avatar">MB</div>
            <div>
              <div className="msg-bubble" style={{ color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner /> Typing...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {QUICK.map((q, i) => (
          <button key={i} className="btn btn-secondary btn-sm" style={{ borderRadius: 20, fontSize: 11.5 }} onClick={() => send(q)} disabled={typing}>
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Apna sawaal yahan likhein (Hindi or English)..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          disabled={typing}
        />
        <button className="chat-send" onClick={() => send()} disabled={!input.trim() || typing}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
