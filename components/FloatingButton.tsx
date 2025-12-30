import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Persona } from '../types';

interface FloatingButtonProps {
  selectionText: string;
  position: { x: number; y: number };
  onClose: () => void;
  apiKey: string; // Passed from content script storage retrieval
}

// Icons as SVG components to avoid external dependencies in content script
const SparkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const SummarizeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
);
const ExplainIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);
const TranslateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
);

const FloatingButton: React.FC<FloatingButtonProps> = ({ selectionText, position, onClose, apiKey }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'summarize' | 'explain' | 'translate') => {
    if (!apiKey) {
      setResult("Please open the MindSpark extension popup to set your Gemini API Key first.");
      return;
    }

    setLoading(true);
    
    // Quick inline processing for the content script
    // Note: We use the logic directly here or we could import the service. 
    // For safety in content scripts, direct logic is often easier to debug than imports if bundler config is complex.
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = "";
      if (action === 'summarize') prompt = `Summarize this text in 1-2 concise sentences: "${selectionText}"`;
      if (action === 'explain') prompt = `Explain this text simply: "${selectionText}"`;
      if (action === 'translate') prompt = `Translate this text to English (or Spanish if already English): "${selectionText}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setResult(response.text || "No result.");
    } catch (e) {
      setResult("Error processing request. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  // Adjust position to not go off screen
  const style = {
    top: position.y + window.scrollY + 10,
    left: position.x + window.scrollX,
    zIndex: 999999,
  };

  if (result) {
    return (
      <div className="fixed bg-slate-900 text-white p-4 rounded-xl shadow-2xl max-w-sm border border-slate-700 font-sans text-sm animate-in fade-in zoom-in duration-200" style={style}>
        <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
          <span className="font-bold text-indigo-400">MindSpark AI</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="leading-relaxed max-h-60 overflow-y-auto">
          {result}
        </div>
        <button onClick={() => { setResult(null); setIsExpanded(false); }} className="mt-3 text-xs text-slate-400 hover:text-indigo-400 w-full text-center">
          Start New Action
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed flex items-center gap-2"
      style={style}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-indigo-500 transition-all hover:scale-110">
        <SparkIcon />
      </div>

      {isExpanded && (
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-700 shadow-2xl animate-in slide-in-from-left-2 duration-200">
          <button 
            onClick={() => handleAction('summarize')}
            disabled={loading}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white min-w-[70px]"
          >
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"/> : <SummarizeIcon />}
            <span className="text-[10px] font-medium">Summarize</span>
          </button>
          <div className="w-px h-8 bg-slate-700 mx-1"></div>
          <button 
             onClick={() => handleAction('explain')}
             disabled={loading}
             className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white min-w-[70px]"
          >
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"/> : <ExplainIcon />}
            <span className="text-[10px] font-medium">Explain</span>
          </button>
           <div className="w-px h-8 bg-slate-700 mx-1"></div>
          <button 
             onClick={() => handleAction('translate')}
             disabled={loading}
             className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white min-w-[70px]"
          >
            {loading ? <span className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"/> : <TranslateIcon />}
            <span className="text-[10px] font-medium">Translate</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingButton;
