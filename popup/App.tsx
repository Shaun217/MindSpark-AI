import React, { useState, useEffect, useRef } from 'react';
import { generateGeminiResponse } from '../services/geminiService';
import { Persona, ChatMessage } from '../types';

declare var chrome: any;

const App: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState<string>('');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [currentPersona, setCurrentPersona] = useState<Persona>(Persona.STANDARD);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'selectedPersona'], (result: any) => {
      if (result.apiKey) {
        setApiKey(result.apiKey);
        setHasKey(true);
      } else {
        setShowSettings(true);
      }
      if (result.selectedPersona) {
        setCurrentPersona(result.selectedPersona);
      }
    });
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const saveSettings = () => {
    if (!apiKey.trim()) return;
    chrome.storage.local.set({ apiKey, selectedPersona: currentPersona }, () => {
      setHasKey(true);
      setShowSettings(false);
    });
  };

  const handleSendMessage = async (text: string, context: string = '') => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await generateGeminiResponse(apiKey, text, currentPersona, context);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `Error: ${error.message || "Something went wrong."}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizePage = async () => {
    if (!hasKey) { setShowSettings(true); return; }
    
    setIsLoading(true);
    // Execute script to get page text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
        }, async (results: any) => {
            if (results && results[0] && results[0].result) {
                const pageText = results[0].result;
                // Truncate if too long to save tokens/bandwidth, though Gemini has large window
                const truncatedText = pageText.substring(0, 10000); 
                await handleSendMessage("Summarize the main points of this webpage content.", truncatedText);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Could not read page content. Ensure you are on a valid webpage.",
                    timestamp: Date.now()
                }]);
                setIsLoading(false);
            }
        });
    }
  };

  const quickAction = async (type: 'explain' | 'fix' | 'translate') => {
      // For MVP, we'll ask user to select text or just prompt genericaly
      await handleSendMessage(
          type === 'explain' ? "Explain the core concept of the current tab context." : 
          type === 'fix' ? "I will paste text, please fix grammar." : 
          "Translate the following content to English."
      );
  };

  // Render Views
  if (showSettings) {
    return (
      <div className="w-[400px] h-[600px] bg-slate-900 text-white flex flex-col p-6 font-sans">
        <h2 className="text-2xl font-bold mb-6 text-indigo-400">Settings</h2>
        
        <label className="text-sm text-slate-400 mb-2">Google Gemini API Key</label>
        <input 
          type="password" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none mb-4"
          placeholder="AIzaSy..."
        />
        <p className="text-xs text-slate-500 mb-6">
          You can get your key from Google AI Studio. The key is stored locally in your browser.
        </p>

        <button 
          onClick={saveSettings}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Save & Continue
        </button>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[600px] bg-[#121121] text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#1c1b2e] z-10 shrink-0">
        <div className="flex items-center gap-2 text-indigo-500">
          <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
          <h1 className="text-lg font-bold tracking-tight text-white">MindSpark AI</h1>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="text-slate-400 hover:text-indigo-500 transition-colors p-1 rounded-full hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-[#121121] scrollbar-thin scrollbar-thumb-slate-700">
        
        {/* Quick Actions */}
        <div className="px-5 pt-5 pb-2">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={summarizePage} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1c1b2e] border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group">
              <span className="material-symbols-outlined text-indigo-500 text-2xl group-hover:scale-110 transition-transform">article</span>
              <span className="text-xs font-medium text-slate-300">Summarize</span>
            </button>
            <button onClick={() => quickAction('explain')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1c1b2e] border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group">
              <span className="material-symbols-outlined text-indigo-500 text-2xl group-hover:scale-110 transition-transform">help</span>
              <span className="text-xs font-medium text-slate-300">Explain This</span>
            </button>
            <button onClick={() => quickAction('fix')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1c1b2e] border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group">
              <span className="material-symbols-outlined text-indigo-500 text-2xl group-hover:scale-110 transition-transform">spellcheck</span>
              <span className="text-xs font-medium text-slate-300">Fix Grammar</span>
            </button>
            <button onClick={() => quickAction('translate')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1c1b2e] border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all group">
              <span className="material-symbols-outlined text-indigo-500 text-2xl group-hover:scale-110 transition-transform">translate</span>
              <span className="text-xs font-medium text-slate-300">Translate</span>
            </button>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Object.values(Persona).map((p) => (
              <button 
                key={p}
                onClick={() => setCurrentPersona(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  currentPersona === p 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-[#1c1b2e] border-slate-700 text-slate-300 hover:border-indigo-500/50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 px-5 py-2 space-y-4 mb-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1`}>
               {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[14px] text-indigo-500">auto_awesome</span>
                    </div>
                    <span className="text-[10px] text-slate-400">MindSpark AI</span>
                  </div>
               )}
               <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                 msg.role === 'user' 
                 ? 'bg-indigo-600 text-white rounded-br-none' 
                 : 'bg-[#1c1b2e] border border-slate-700/50 text-slate-300 rounded-tl-none whitespace-pre-wrap'
               }`}>
                 {msg.text}
               </div>
               {msg.role === 'user' && <span className="text-[10px] text-slate-400 pr-1">You</span>}
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start gap-1 w-full animate-pulse">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center"></div>
                  <span className="text-[10px] text-slate-400">MindSpark AI</span>
               </div>
               <div className="max-w-[90%] bg-[#1c1b2e] border border-slate-700/50 px-4 py-3 rounded-2xl rounded-tl-none w-full">
                  <div className="space-y-2">
                    <div className="h-2.5 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-2.5 bg-slate-700 rounded w-full"></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 bg-[#1c1b2e] border-t border-slate-800 shrink-0">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }
              }}
              className="w-full bg-[#131221] text-white text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none border-0 placeholder-slate-400"
              placeholder="Ask anything..."
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button 
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="h-[44px] w-[44px] flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;