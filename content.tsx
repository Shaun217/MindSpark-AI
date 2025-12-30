import React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingButton from './components/FloatingButton';

declare var chrome: any;

// Container for our app
const containerId = 'mindspark-ai-extension-root';
let rootContainer: HTMLElement | null = null;
let reactRoot: any = null;

// Helper to get API Key safely
const getApiKey = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result: any) => {
      resolve(result.apiKey || '');
    });
  });
};

const handleSelection = async () => {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  // If text is empty or too short, unmount and hide
  if (!text || text.length < 3) {
    if (rootContainer) {
       // We don't remove the container completely to avoid thrashing, 
       // but we render nothing into it or hide it.
       if(reactRoot) {
           reactRoot.unmount();
           reactRoot = null;
       }
       rootContainer.remove();
       rootContainer = null;
    }
    return;
  }

  // Calculate position
  const range = selection?.getRangeAt(0);
  const rect = range?.getBoundingClientRect();

  if (!rect) return;

  // Create container if not exists
  if (!rootContainer) {
    rootContainer = document.createElement('div');
    rootContainer.id = containerId;
    document.body.appendChild(rootContainer);
  }

  // Use Shadow DOM to isolate styles
  if (!rootContainer.shadowRoot) {
    rootContainer.attachShadow({ mode: 'open' });
  }
  
  const shadowRoot = rootContainer.shadowRoot!;
  
  // Inject basic Tailwind-like styles into shadow DOM
  // In a real production build, we would import the css file as a string
  const style = document.createElement('style');
  style.textContent = `
    .fixed { position: fixed; }
    .absolute { position: absolute; }
    .bg-indigo-600 { background-color: #4f46e5; }
    .bg-indigo-500 { background-color: #6366f1; }
    .bg-slate-900 { background-color: #0f172a; }
    .text-white { color: #ffffff; }
    .text-slate-300 { color: #cbd5e1; }
    .text-slate-400 { color: #94a3b8; }
    .text-indigo-400 { color: #818cf8; }
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .flex-col { flex-direction: column; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .border { border-width: 1px; }
    .border-slate-700 { border-color: #334155; }
    .cursor-pointer { cursor: pointer; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .hover\\:scale-110:hover { transform: scale(1.1); }
    .hover\\:bg-indigo-500:hover { background-color: #6366f1; }
    .hover\\:bg-slate-700:hover { background-color: #334155; }
    .hover\\:text-white:hover { color: #ffffff; }
    .w-5 { width: 1.25rem; }
    .h-5 { height: 1.25rem; }
    .w-px { width: 1px; }
    .h-8 { height: 2rem; }
    .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
    .min-w-\\[70px\\] { min-width: 70px; }
    .text-\\[10px\\] { font-size: 10px; }
    .font-medium { font-weight: 500; }
    .font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    .backdrop-blur-sm { backdrop-filter: blur(4px); }
  `;
  
  // Ensure we don't append duplicate styles
  if (!shadowRoot.querySelector('style')) {
      shadowRoot.appendChild(style);
  }

  // Create a mount point inside shadow DOM
  let mountPoint = shadowRoot.getElementById('mount-point');
  if (!mountPoint) {
      mountPoint = document.createElement('div');
      mountPoint.id = 'mount-point';
      shadowRoot.appendChild(mountPoint);
  }

  // Render logic
  if (!reactRoot) {
      reactRoot = createRoot(mountPoint);
  }

  const apiKey = await getApiKey();

  // Determine positions (floating near the selection)
  // rect.left + window.scrollX, rect.top + window.scrollY
  const posX = rect.left + (rect.width / 2) - 20; // Center it roughly
  const posY = rect.top - 40; // Above the text

  reactRoot.render(
      <FloatingButton 
          selectionText={text} 
          position={{ x: posX, y: posY }} 
          onClose={() => {
              if (reactRoot) {
                  reactRoot.unmount();
                  reactRoot = null;
              }
              if (rootContainer) {
                  rootContainer.remove();
                  rootContainer = null;
              }
          }}
          apiKey={apiKey}
      />
  );
};

// Debounce helper
let timeoutId: any = null;
document.addEventListener('mouseup', () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(handleSelection, 200);
});

// Also handle keyup for keyboard selection
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
         if (timeoutId) clearTimeout(timeoutId);
         timeoutId = setTimeout(handleSelection, 500);
    }
});