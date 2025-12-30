// content.js - Pure JS with Shadow DOM

let shadowHost = null;
let shadowRoot = null;
let activeContainer = null;
let activeMenu = null;
let floatBtn = null;
let isResultMode = false;

// Icons
const ICONS = {
    spark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>`,
    copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    summarize: '📝',
    explain: '🤔',
    translate: '🌐'
};

// CSS Styles
const STYLES = `
    * { box-sizing: border-box; }
    
    .ms-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        color: #e2e8f0;
        line-height: 1.5;
        position: absolute;
        pointer-events: auto; /* Ensure clicks inside are captured */
        z-index: 2147483647;
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
        user-select: none;
    }
    .ms-float-btn:hover { transform: scale(1.1); }

    /* Menu Card */
    .ms-menu {
        position: absolute;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 6px;
        display: none; /* Hidden by default */
        flex-direction: column; gap: 4px;
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
        font-family: inherit;
        user-select: none;
    }
    .ms-action-btn:hover { background: #334155; color: white; }

    /* Result Card (Expanded Menu) */
    .ms-result-card {
        display: flex; flex-direction: column;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.6);
        width: 340px;
        max-width: 90vw;
        overflow: hidden;
        animation: ms-expand 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ms-header {
        padding: 12px 16px;
        background: #0f172a;
        border-bottom: 1px solid #334155;
        display: flex; justify-content: space-between; align-items: center;
        flex-shrink: 0;
    }
    .ms-title { font-weight: 600; color: #818cf8; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase; }
    .ms-close { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; }
    .ms-close:hover { background: #334155; color: white; }

    .ms-body { 
        padding: 0; 
        position: relative; 
        background: #1e293b; 
        max-height: 400px;
        overflow-y: auto;
    }
    
    .ms-textarea {
        width: 100%;
        min-height: 100px; /* Start smaller, expand with content */
        background: #1e293b;
        color: #f1f5f9;
        border: none;
        padding: 16px;
        resize: vertical;
        outline: none;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.6;
        display: block;
        box-sizing: border-box;
    }

    .ms-footer {
        padding: 10px 16px;
        background: #1e293b;
        border-top: 1px solid #334155;
        display: flex; justify-content: flex-end;
        flex-shrink: 0;
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
        font-family: inherit;
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
    @keyframes ms-expand { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes ms-spin { to { transform: rotate(360deg); } }
`;

// --- Initialization ---

function initShadowDOM() {
    if (shadowHost) return;
    
    shadowHost = document.createElement('div');
    shadowHost.id = 'mindspark-ai-host';
    // The host itself has 0 dimension but allows pointer events on children
    shadowHost.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;';
    
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    shadowRoot.appendChild(styleEl);
    
    document.body.appendChild(shadowHost);
}

// --- Event Listeners ---

document.addEventListener('mouseup', (e) => {
    // If we are clicking inside our shadow DOM, ignore standard selection checks
    if (shadowHost && shadowHost.contains(e.target)) return;

    // Debounce to allow selection to update
    setTimeout(() => {
        handleSelection();
    }, 50);
});

document.addEventListener('mousedown', (e) => {
    // Logic to close UI if clicking outside
    // Note: e.target might be the host if event is retargeted from shadow DOM. 
    // We check if the click target is NOT our host (meaning it's the page).
    
    // In open shadow roots, internal clicks often retarget to the host.
    // If the target IS the host, the click was inside.
    // If the target is NOT the host, the click was outside.
    
    if (shadowHost && e.target !== shadowHost) {
        hideUI();
    }
});

// --- Logic ---

function handleSelection() {
    // If we are displaying a result, do not auto-close or re-open on selection change
    if (isResultMode) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        initShadowDOM();

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Position: Center above selection
        const x = rect.left + scrollX + (rect.width / 2);
        const y = rect.top + scrollY - 45;

        showFloatingButton(x, y, text);
    } else {
        // Only hide if not in result mode (checked above)
        hideUI();
    }
}

function hideUI() {
    if (shadowRoot && activeContainer) {
        activeContainer.remove();
        activeContainer = null;
        activeMenu = null;
        floatBtn = null;
        isResultMode = false;
    }
}

function showFloatingButton(x, y, text) {
    if (isResultMode) return; // Double check protection

    // If container exists, update position? No, simpler to recreate for MVP or just move it.
    // For smoothness, if it exists and we are just updating text selection, maybe move it.
    // But here we recreate to ensure fresh state.
    if (activeContainer) {
        activeContainer.remove();
    }

    const container = document.createElement('div');
    container.className = 'ms-container';
    
    // Button
    const btn = document.createElement('div');
    btn.className = 'ms-float-btn';
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.innerHTML = ICONS.spark;
    
    // PREVENT SELECTION LOSS: Stop mousedown propagation
    btn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault(); };

    // Menu Container
    const menu = document.createElement('div');
    menu.className = 'ms-menu';
    // Initial position: centered below button
    menu.style.left = `${x}px`;
    menu.style.top = `${y + 45}px`;
    menu.style.transform = 'translateX(-50%)';

    // Prevent selection loss on menu click
    menu.onmousedown = (e) => { e.stopPropagation(); e.preventDefault(); };

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
            e.stopPropagation(); // Stop bubbling
            // We transform the current UI into the Result UI
            transformToResult(container, menu, action, text, x, y);
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
    
    activeContainer = container;
    activeMenu = menu;
    floatBtn = btn;
}

function transformToResult(container, menuElement, action, text, x, y) {
    // 1. Set Mode
    isResultMode = true;

    // 2. Hide Button
    if (floatBtn) floatBtn.style.display = 'none';

    // 3. Transform Menu style to Result Card style
    menuElement.className = 'ms-result-card';
    menuElement.style.transform = 'none'; // Remove centering transform if we calculate manually
    
    // Recalculate position to keep it on screen
    const width = 340;
    let finalX = x - (width / 2);
    // Boundary checks
    if (finalX < 10) finalX = 10;
    if (finalX + width > window.innerWidth) finalX = window.innerWidth - width - 10;
    
    menuElement.style.left = `${finalX}px`;
    menuElement.style.top = `${y}px`; // Move it up to where button was? Or keep below? Let's move to Y.

    // 4. Show Loading UI
    menuElement.innerHTML = `
        <div class="ms-header">
            <span class="ms-title">${action.label}</span>
            <button class="ms-close">${ICONS.close}</button>
        </div>
        <div class="ms-body">
            <div class="ms-loading">
                <div class="ms-spinner"></div>
                <span>MindSpark is thinking...</span>
            </div>
        </div>
    `;

    // Re-attach listeners because innerHTML wiped them
    menuElement.querySelector('.ms-close').onclick = hideUI;
    // Prevent selection clearing when interacting with the card
    menuElement.onmousedown = (e) => { e.stopPropagation(); }; 

    // 5. API Call
    chrome.storage.local.get(['apiKey'], (result) => {
        if (!result.apiKey) {
            renderError(menuElement, "API Key missing. Please open extension settings.");
            return;
        }

        const prompt = `${action.prompt}\n\n"${text}"`;

        chrome.runtime.sendMessage({
            action: 'CALL_GEMINI',
            apiKey: result.apiKey,
            prompt: prompt
        }, (response) => {
            if (chrome.runtime.lastError) {
                renderError(menuElement, "Connection failed: " + chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                renderResult(menuElement, response.data);
            } else {
                renderError(menuElement, response.error || "Unknown error occurred.");
            }
        });
    });
}

function renderResult(card, text) {
    const body = card.querySelector('.ms-body');
    // We replace the loading body with the textarea
    body.innerHTML = `
        <textarea class="ms-textarea" spellcheck="false"></textarea>
    `;
    const textarea = body.querySelector('textarea');
    textarea.value = text;

    // Auto-resize logic
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 10) + 'px';

    // Footer
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
        document.execCommand('copy');
        
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

function renderError(card, msg) {
    const body = card.querySelector('.ms-body');
    body.innerHTML = `
        <div style="padding: 20px; color: #ef4444; font-size: 13px; text-align: center;">
            ${msg}
        </div>
    `;
}