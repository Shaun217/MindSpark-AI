// content.js - Pure JS with Shadow DOM

let shadowHost = null;
let shadowRoot = null;
let floatBtn = null;
let activeMenu = null;

// Icons
const ICONS = {
    spark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>`,
    copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    summarize: '📝',
    explain: '🤔',
    translate: '🌐'
};

// CSS Styles (Injected into Shadow DOM to avoid conflicts)
const STYLES = `
    * { box-sizing: border-box; }
    
    .ms-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.5;
    }

    /* Floating Button */
    .ms-float-btn {
        position: absolute;
        width: 36px; height: 36px;
        background: #4f46e5;
        color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        border: 2px solid white;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 1000;
    }
    .ms-float-btn:hover { transform: scale(1.1); }

    /* Menu Card */
    .ms-menu {
        position: absolute;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 6px;
        display: flex; flex-direction: column; gap: 4px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        min-width: 160px;
        z-index: 1000;
        animation: ms-fade-in 0.15s ease-out;
    }

    .ms-action-btn {
        background: transparent;
        border: none;
        color: #cbd5e1;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        display: flex; align-items: center; gap: 10px;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.1s;
    }
    .ms-action-btn:hover { background: #334155; color: white; }

    /* Result Card */
    .ms-result-card {
        position: absolute;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        display: flex; flex-direction: column;
        box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.6);
        width: 340px;
        max-width: 90vw;
        overflow: hidden;
        z-index: 1001;
        animation: ms-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ms-header {
        padding: 12px 16px;
        background: #0f172a;
        border-bottom: 1px solid #334155;
        display: flex; justify-content: space-between; align-items: center;
    }
    .ms-title { font-weight: 600; color: #818cf8; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; }
    .ms-close { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; }
    .ms-close:hover { background: #334155; color: white; }

    .ms-body { padding: 0; position: relative; background: #1e293b; }
    
    .ms-textarea {
        width: 100%;
        min-height: 120px;
        max-height: 400px;
        background: #1e293b;
        color: #f1f5f9;
        border: none;
        padding: 16px;
        resize: vertical;
        outline: none;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.6;
    }

    .ms-footer {
        padding: 10px 16px;
        background: #1e293b;
        border-top: 1px solid #334155;
        display: flex; justify-content: flex-end;
    }

    .ms-btn-primary {
        background: #4f46e5;
        color: white;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        display: flex; align-items: center; gap: 6px;
        transition: background 0.1s;
    }
    .ms-btn-primary:hover { background: #4338ca; }
    .ms-btn-primary:active { transform: translateY(1px); }

    .ms-loading {
        padding: 30px;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
        color: #94a3b8;
        font-size: 13px;
    }
    .ms-spinner {
        width: 20px; height: 20px;
        border: 2px solid #334155;
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: ms-spin 0.8s linear infinite;
    }

    @keyframes ms-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ms-slide-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ms-spin { to { transform: rotate(360deg); } }
`;

// Initialize Shadow DOM container
function initShadowDOM() {
    if (shadowHost) return;
    
    shadowHost = document.createElement('div');
    shadowHost.id = 'mindspark-ai-host';
    shadowHost.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;';
    
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    shadowRoot.appendChild(styleEl);
    
    document.body.appendChild(shadowHost);
}

// Global Event Listeners
document.addEventListener('mouseup', (e) => {
    // Debounce to allow selection to update
    setTimeout(() => {
        handleSelection();
    }, 50);
});

// Close UI on click outside (need to handle shadow dom click boundary)
document.addEventListener('mousedown', (e) => {
    if (shadowHost && !shadowHost.contains(e.target)) {
        // We can't easily detect clicks *inside* shadow DOM from outside event without composition
        // So we rely on the shadow DOM elements to stop propagation if clicked
        hideUI(); 
    }
});

function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        // Ensure Shadow DOM exists
        initShadowDOM();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Coordinates relative to viewport + scroll
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Position logic: Center above selection
        const x = rect.left + scrollX + (rect.width / 2);
        const y = rect.top + scrollY - 45;

        showFloatingButton(x, y, text);
    } else {
        // Don't hide immediately if we are interacting with the menu
        // But for now, simple logic: if no text selection, no button
        // We handle "keeping open" via specific logic in the menu
    }
}

function hideUI() {
    if (shadowRoot) {
        const container = shadowRoot.querySelector('.ms-container');
        if (container) container.remove();
        floatBtn = null;
        activeMenu = null;
    }
}

function showFloatingButton(x, y, text) {
    // If a result card is open, do not disturb it with new selection logic unless intentional
    if (activeMenu && activeMenu.dataset.type === 'result') return;

    hideUI();

    const container = document.createElement('div');
    container.className = 'ms-container';
    // Pointer events auto to allow interaction inside our zero-size host
    container.style.cssText = 'pointer-events: auto; position: absolute; top: 0; left: 0;'; 
    
    // Button
    const btn = document.createElement('div');
    btn.className = 'ms-float-btn';
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.innerHTML = ICONS.spark;
    
    // Prevent document mousedown from closing it
    btn.onmousedown = (e) => e.stopPropagation();

    // Menu Container
    const menu = document.createElement('div');
    menu.className = 'ms-menu';
    menu.style.display = 'none'; // Initially hidden
    menu.style.left = `${x}px`;
    menu.style.top = `${y + 45}px`;
    menu.style.transform = 'translateX(-50%)'; // Center align

    const actions = [
        { label: 'Summarize', icon: ICONS.summarize, prompt: 'Summarize this text in concise bullet points:' },
        { label: 'Explain', icon: ICONS.explain, prompt: 'Explain this text simply like I am 5 years old:' },
        { label: 'Translate', icon: ICONS.translate, prompt: 'Translate this text to English:' }
    ];

    actions.forEach(action => {
        const item = document.createElement('button');
        item.className = 'ms-action-btn';
        item.innerHTML = `<span>${action.icon}</span> ${action.label}`;
        item.onclick = (e) => {
            e.stopPropagation();
            processAction(action, text, x, y);
        };
        menu.appendChild(item);
    });

    // Hover Interaction
    let hideTimeout;
    const showMenu = () => {
        clearTimeout(hideTimeout);
        menu.style.display = 'flex';
    };
    const hideMenu = () => {
        hideTimeout = setTimeout(() => {
            menu.style.display = 'none';
        }, 300);
    };

    btn.onmouseenter = showMenu;
    btn.onmouseleave = hideMenu;
    menu.onmouseenter = showMenu;
    menu.onmouseleave = hideMenu;

    container.appendChild(btn);
    container.appendChild(menu);
    shadowRoot.appendChild(container);
    
    floatBtn = btn;
    activeMenu = menu;
}

function processAction(action, text, x, y) {
    // Replace Button/Menu with Result Card
    hideUI();
    initShadowDOM();

    const container = document.createElement('div');
    container.className = 'ms-container';
    container.style.cssText = 'pointer-events: auto; position: absolute; top: 0; left: 0;';

    const card = document.createElement('div');
    card.className = 'ms-result-card';
    card.dataset.type = 'result';
    
    // Position logic to keep on screen
    const width = 340;
    let finalX = x - (width / 2);
    if (finalX < 10) finalX = 10;
    if (finalX + width > window.innerWidth) finalX = window.innerWidth - width - 10;
    
    card.style.left = `${finalX}px`;
    card.style.top = `${y}px`;

    // 1. Render Loading State
    card.innerHTML = `
        <div class="ms-header">
            <span class="ms-title">${action.label}</span>
            <button class="ms-close">${ICONS.close}</button>
        </div>
        <div class="ms-body">
            <div class="ms-loading">
                <div class="ms-spinner"></div>
                <span>Thinking...</span>
            </div>
        </div>
    `;

    // Close Handler
    card.querySelector('.ms-close').onclick = hideUI;
    card.onmousedown = (e) => e.stopPropagation();

    container.appendChild(card);
    shadowRoot.appendChild(container);
    activeMenu = card;

    // 2. Perform API Call
    chrome.storage.local.get(['apiKey'], (result) => {
        if (!result.apiKey) {
            renderErrorInCard(card, "API Key missing. Please open extension settings.");
            return;
        }

        const prompt = `${action.prompt}\n\n"${text}"`;

        // Send to Background Script
        chrome.runtime.sendMessage({
            action: 'CALL_GEMINI',
            apiKey: result.apiKey,
            prompt: prompt
        }, (response) => {
            if (chrome.runtime.lastError) {
                renderErrorInCard(card, "Connection failed: " + chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                renderResultInCard(card, response.data);
            } else {
                renderErrorInCard(card, response.error || "Unknown error occurred.");
            }
        });
    });
}

function renderResultInCard(card, text) {
    const body = card.querySelector('.ms-body');
    body.innerHTML = `
        <textarea class="ms-textarea" spellcheck="false"></textarea>
    `;
    const textarea = body.querySelector('textarea');
    textarea.value = text;

    // Append Footer
    const footer = document.createElement('div');
    footer.className = 'ms-footer';
    footer.innerHTML = `
        <button class="ms-btn-primary">
            ${ICONS.copy} Copy
        </button>
    `;

    const copyBtn = footer.querySelector('button');
    copyBtn.onclick = () => {
        textarea.select();
        document.execCommand('copy'); // Legacy but works reliably in extensions
        // Or navigator.clipboard.writeText(textarea.value);
        
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span>✅</span> Copied!`;
        copyBtn.style.background = '#059669';
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.style.background = '#4f46e5';
        }, 2000);
    };

    card.appendChild(footer);
}

function renderErrorInCard(card, msg) {
    const body = card.querySelector('.ms-body');
    body.innerHTML = `
        <div style="padding: 20px; color: #ef4444; font-size: 13px; text-align: center;">
            ${msg}
        </div>
    `;
}
