'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingGrokButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [currentContext, setCurrentContext] = useState<{ slug?: string; name?: string; type: string }>({ type: 'general' });

  // Ref to always call the latest sendMessage (avoids stale closure from empty-deps effect)
  const sendMessageRef = useRef(sendMessage);

  // Keep ref updated
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  // Support pre-filling the chat (e.g. from + New Domain orb)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const msg = e.detail?.message;
      if (msg) {
        setIsOpen(true);
        setInput(msg);
        // Auto-send the prefilled message for seamless experience (e.g. create domain)
        setTimeout(() => {
          sendMessageRef.current(msg);
        }, 100);
      }
    };
    window.addEventListener('open-hermes-chat' as any, handler);
    return () => window.removeEventListener('open-hermes-chat' as any, handler);
  }, []);

  // Detect current page context across the entire Forge (techniques, equipment, fitness, etc.)
  useEffect(() => {
    const updateContext = () => {
      const path = window.location.pathname;
      let name: string | undefined;
      let slug: string | undefined;
      let type = 'general';

      const h1 = document.querySelector('h1')?.textContent?.trim();

      if (path.includes('/techniques/') && path !== '/techniques') {
        slug = path.split('/techniques/')[1]?.split('?')[0];
        name = h1 || slug;
        type = 'technique';
      } else if (path.includes('/shop/equipment/')) {
        slug = path.split('/shop/equipment/')[1]?.split('?')[0];
        name = h1 || slug;
        type = 'equipment';
      } else if (path.includes('/fitness/')) {
        slug = path.split('/fitness/')[1]?.split('?')[0] || path.split('/fitness').pop() || undefined;
        name = h1 || 'Fitness';
        type = 'fitness';
      } else if (path.includes('/shop')) {
        name = h1 || 'Shop & Equipment';
        type = 'shop';
      } else if (path.includes('/domains/')) {
        slug = path.split('/domains/')[1]?.split('?')[0] || undefined;
        name = h1 || slug || 'Forge Domain';
        type = 'domain';
      } else if (path.includes('/forge')) {
        name = h1 || 'Forge Domains';
        type = 'forge';
      } else {
        name = h1 || undefined;
        type = 'general';
      }

      const displayName = name || 'the Forge';

      setCurrentContext({ 
        slug: slug || undefined, 
        name: displayName,
        type 
      });

      // Set dynamic greeting with context on the page
      const greeting = `Hi. On ${displayName}. What would you like to do?`;

      setMessages(prev => {
        // Set or replace initial greeting if first message or default
        if (prev.length === 0 || prev[0].content.startsWith('Hi') || prev[0].content.includes('connected') || prev[0].content.includes('Forge data')) {
          return [{ role: 'assistant', content: greeting }];
        }
        // If no greeting yet, prepend (for navigation)
        if (!prev.some(m => m.content.startsWith('Hi. On'))) {
          return [{ role: 'assistant', content: greeting }, ...prev];
        }
        return prev;
      });
    };

    updateContext();
    // Re-check on navigation (simple polling for SPA-like feel)
    const interval = setInterval(updateContext, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (overrideMessage?: string) => {
    const messageToUse = overrideMessage || input;
    if (!messageToUse.trim() || isWriting) return;
    
    const userMessage = messageToUse.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsWriting(true);

    // Add a "thinking" message
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking with your vault data...' }]);

    try {
      // Call our new context-aware Grok chat API
      const res = await fetch('/api/forge/grok-chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            currentPath: window.location.pathname,
            currentSlug: currentContext.slug,
            currentName: currentContext.name,
            pageType: currentContext.type,
          }
        })
      });

      const data = await res.json();

      // Remove the "thinking" message and add the real response
      setMessages(prev => {
        const withoutThinking = prev.slice(0, -1);
        return [...withoutThinking, { 
          role: 'assistant', 
          content: data.response || 'Sorry, I had trouble processing that with your data.' 
        }];
      });

      // If the response includes a proposed change + we can apply, show an Apply button in follow-up messages
      if (data.canApply && data.proposedChange) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `I have a proposed update ready. Would you like me to write it to the vault now? (This will edit the Obsidian file for this technique.)`
          }]);
        }, 600);
      }

    } catch (error) {
      setMessages(prev => {
        const withoutThinking = prev.slice(0, -1);
        return [...withoutThinking, { 
          role: 'assistant', 
          content: 'Error reaching the backend. Make sure the dev server is running.' 
        }];
      });
    } finally {
      setIsWriting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-[999] transition-all active:scale-90 border-2 border-white/20"
        title="Context-aware Grok (your vault + current page)"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[560px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-950">
            <div className="font-semibold flex items-center gap-2">
              💬 Grok <span className="text-xs text-blue-400">(with your Forge data)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] p-3.5 rounded-2xl whitespace-pre-wrap text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isWriting && <div className="text-blue-400 italic text-sm">Working with your vault data...</div>}
          </div>

          <div className="p-4 border-t border-zinc-700 bg-zinc-950">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or tell me what to do..." 
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                disabled={isWriting}
              />
              <button 
                onClick={() => sendMessage()} 
                disabled={isWriting || !input.trim()} 
                className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-medium text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {currentContext.name && (
              <div className="text-[10px] text-center text-zinc-500 mt-2">
                Context: {currentContext.name} ({currentContext.type})
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
