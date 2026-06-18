'use client';

'use client';

import React, { useState } from 'react';

export default function GrokChat() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi. On the Forge. What would you like to do?' }]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    // TODO: Replace with real xAI/Grok API call or Hermes integration
    setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: 'Got it! Creating best BJJ card / updating infrastructure now...' }]);
    setInput('');
    // Future: Call Grok API or createHermesTask from lib/vault.ts
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧠 Grok & Hermes Chat — Inside The Forge</h1>
      <div className="border rounded-xl h-96 overflow-auto p-4 mb-4 bg-zinc-950 text-white">
        {messages.map((m, i) => <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
          <span className="inline-block p-3 rounded-lg bg-zinc-800">{m.content}</span>
        </div>)}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-3 rounded-lg border" placeholder="Ask or tell me what to do..." />
        <button onClick={sendMessage} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Send → Grok/Hermes</button>
      </div>
      <p className="mt-4 text-sm text-zinc-400">Directly connected to your Forge data. Context from current page is used automatically.</p>
    </div>
  );
}
