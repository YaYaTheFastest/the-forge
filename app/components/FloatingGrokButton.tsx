'use client';

import { useState, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingGrokButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hi Darren. I\'m connected to your Forge data.\n\nOn a technique page I can see the full card + your notes + the permanent 2026 GB1 golden standard.\n\nTry:\n• "Improve this card to full golden standard"\n• "Rewrite the personal cues to be more field-usable"\n• "What are the key principles here?"\n• "Add 3 good video suggestions and apply them"' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [currentContext, setCurrentContext] = useState<{ slug?: string; name?: string; isTechnique: boolean }>({ isTechnique: false });

  // Detect current page context (especially technique pages)
  useEffect(() => {
    const updateContext = () => {
      const path = window.location.pathname;
      const isTechnique = path.includes('/techniques/') && path !== '/techniques';
      
      if (isTechnique) {
        // Try to extract slug and name from the page if possible
        const slug = path.split('/techniques/')[1]?.split('?')[0];
        // The page title or h1 usually has the technique name
        const h1 = document.querySelector('h1')?.textContent?.trim();
        
        setCurrentContext({ 
          slug: slug || undefined, 
          name: h1 || undefined,
          isTechnique: true 
        });
        
        setMessages(prev => {
          // Avoid duplicate context messages
          if (prev.some(m => m.content.includes('Current technique context loaded'))) return prev;
          return [...prev, { 
            role: 'assistant', 
            content: `Current technique context loaded: ${h1 || slug}\nI can now read the full card and your personal notes, and make real changes when you ask.` 
          }];
        });
      } else {
        setCurrentContext({ isTechnique: false });
      }
    };

    updateContext();
    // Re-check on navigation (simple polling for SPA-like feel)
    const interval = setInterval(updateContext, 2000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isWriting) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsWriting(true);

    // Add a "thinking" message
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking with your vault data...' }]);

    try {
      // Call our new context-aware Grok chat API
      const res = await fetch('/api/forge/grok-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            currentPath: window.location.pathname,
            currentSlug: currentContext.slug,
            currentName: currentContext.name,
            isTechniquePage: currentContext.isTechnique,
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
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl z-50 transition-all active:scale-90 border-2 border-white/20"
        title="Context-aware Grok (your vault + current page)"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[560px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden">
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
                placeholder={currentContext.isTechnique ? "Improve this card..." : "Ask about your data..."} 
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                disabled={isWriting}
              />
              <button 
                onClick={sendMessage} 
                disabled={isWriting || !input.trim()} 
                className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl font-medium text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {currentContext.isTechnique && (
              <div className="text-[10px] text-center text-zinc-500 mt-2">
                Context: {currentContext.name || currentContext.slug} (full card loaded)
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
