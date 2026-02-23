import { useState, useRef, useEffect } from 'react';
import { askAdvisor } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ChatMessage from '../components/ChatMessage';
import './Advisor.css';

const RECENT_KEY = 'advisor_recent_queries';
const MAX_RECENT = 8;

function getRecentQueries() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentQuery(query) {
  const q = query.trim();
  if (!q) return;
  let recent = getRecentQueries().filter((r) => r !== q);
  recent = [q, ...recent].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch (_) {}
}

const QUICK_ACTIONS = [
  { label: 'Students needing intervention', query: 'Which students need intervention?' },
  { label: 'Class overview', query: 'Give me a class overview' },
  { label: 'Topic analysis', query: 'Topic analysis' },
];

export default function Advisor() {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentQueries, setRecentQueries] = useState(getRecentQueries);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = 'AI Advisor – Student Advisor AI';
    return () => { document.title = 'Student Advisor AI'; };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (queryText) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { isUser: true, message: q }]);
    setLoading(true);
    setError(null);
    saveRecentQuery(q);
    setRecentQueries(getRecentQueries());

    try {
      const res = await askAdvisor(q);
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          type: res.response_type || 'general',
          message: res.message || 'Done.',
          data: res.data,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Request failed');
      addToast(err.message || 'Request failed', 'error');
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          type: 'general',
          message: 'Sorry, something went wrong. Please try again.',
          data: null,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (query) => {
    sendMessage(query);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    addToast('Conversation cleared', 'success');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(
      () => addToast('Copied to clipboard', 'success'),
      () => addToast('Copy failed', 'error')
    );
  };

  return (
    <div className="advisor">
      <header className="advisor-header">
        <div className="advisor-header-row">
          <div>
            <h1 className="advisor-title">AI Advisor</h1>
            <p className="advisor-subtitle">Ask about interventions, student risk, or generate quizzes</p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              className="advisor-clear"
              onClick={handleClearChat}
              aria-label="Clear conversation"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="advisor-error">
          <span className="advisor-error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="advisor-chat">
        <div className="advisor-messages">
          {messages.length === 0 && (
            <div className="advisor-welcome">
              <p>Ask anything: student risk, interventions, or generate a quiz for a high-risk student.</p>
              <div className="advisor-quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.query}
                    type="button"
                    className="advisor-quick-btn"
                    onClick={() => handleQuickAction(action.query)}
                    disabled={loading}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              {recentQueries.length > 0 && (
                <div className="advisor-recent">
                  <p className="advisor-recent-label">Recent</p>
                  <div className="advisor-recent-chips">
                    {recentQueries.map((query) => (
                      <button
                        key={query}
                        type="button"
                        className="advisor-recent-chip"
                        onClick={() => handleQuickAction(query)}
                        disabled={loading}
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              isUser={msg.isUser}
              type={msg.type}
              message={msg.message}
              data={msg.data}
              onCopy={handleCopy}
            />
          ))}
          {loading && (
            <div className="advisor-loading">
              <div className="advisor-spinner" />
              <span>Thinking…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="advisor-input-wrap">
          <div className="advisor-quick-row">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.query}
                type="button"
                className="advisor-quick-btn advisor-quick-btn--small"
                onClick={() => handleQuickAction(action.query)}
                disabled={loading}
              >
                {action.label}
              </button>
            ))}
          </div>
          <div className="advisor-input-inner">
            <input
              ref={inputRef}
              type="text"
              className="advisor-input"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
            <button
              type="button"
              className="advisor-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
