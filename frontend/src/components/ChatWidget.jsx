import { useState } from 'react';
import * as chatApi from '../api/chat';
import { useAuth } from '../context/AuthContext';

const prompts = {
  customer: ['What is best rated?', 'Show popular reels', 'Recommend something for me', 'What is cheap under $12?', 'Show my orders'],
  partner: ['How is revenue?', 'Give me a sales summary', 'What are my best listings?', 'What is trending?', 'Show engagement', 'Summarize reviews']
};

function DataPreview({ data }) {
  if (!data) return null;
  const rows = Array.isArray(data) ? data : data.foods || data.latest || data.byRevenue || data.trendingFoods;
  if (Array.isArray(rows) && rows.length) {
    return <div className="chat-data">{rows.slice(0, 4).map((item, index) => {
      const record = item.food || item;
      const label = record.name || record.caption || record.customer?.name || 'Order update';
      const detail = record.price !== undefined
        ? `$${Number(record.price).toFixed(2)}`
        : record.revenue !== undefined
          ? `$${Number(record.revenue).toFixed(2)}`
          : record.views !== undefined
            ? `${record.views} views`
            : record.status || '';
      return <div className="chat-data-row" key={record._id || index}><span>{label}</span><small>{detail}</small></div>;
    })}</div>;
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data).filter(([, value]) => value !== null && typeof value !== 'object');
    if (!entries.length) return null;
    return <div className="chat-data">{entries.slice(0, 4).map(([key, value]) => <div className="chat-data-row" key={key}><span>{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</span><small>{typeof value === 'number' ? Number(value).toFixed(2) : String(value)}</small></div>)}</div>;
  }
  return null;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  if (!user) return null;
  async function send(value = message) {
    const text = value.trim();
    if (!text || loading) return;
    setMessage('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setLoading(true);
    try {
      const result = await chatApi.sendMessage(text);
      setMessages((current) => [...current, { role: 'assistant', text: result.reply, data: result.data }]);
    } catch (error) {
      void error;
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not reach the kitchen brain. Try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  }
  return <aside className={open ? 'chat-widget open' : 'chat-widget'}><button className="chat-launcher" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close food assistant' : 'Open food assistant'}>✦</button>{open && <div className="chat-panel"><div className="chat-header"><div><span className="eyebrow">FoodSnap assistant</span><strong>Ask your kitchen guide.</strong></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close assistant">×</button></div><div className="chat-messages">{!messages.length && <div className="chat-welcome"><p>Real answers from your FoodSnap data.</p><div className="chat-prompts">{prompts[user.role].map((prompt) => <button key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div></div>}{messages.map((item, index) => <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}><p>{item.text}</p><DataPreview data={item.data} /></div>)}{loading && <div className="chat-message assistant"><p>Thinking…</p></div>}</div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about your food story…" aria-label="Ask the assistant" /><button className="button button-accent button-small" disabled={loading}>Send</button></form></div>}</aside>;
}
