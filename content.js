// content.js - Design V2 (Premium Dark Theme)

console.log('MindSpark AI: Loaded (Design V2)');

let shadowHost = null;
let shadowRoot = null;
let activeContainer = null;
let activeMenu = null;
let floatBtn = null;
let isInteracting = false; 

// --- Configuration ---
const CONFIG = {
    defaultHeight: 140, // px
    colors: {
        primary: '#5048e5',
        menuBg: '#1a192e',
        panelBg: '#232238',
        textMain: '#e2e8f0',
        textSub: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.08)'
    }
};

// --- Icons (SVG) ---
const ICONS = {
    spark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>`,
    copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    chevronDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    summarize: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5048e5" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
    explain: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5048e5" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    translate: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5048e5" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    grammar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5048e5" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`
};

// --- CSS Styles ---
const STYLES = `
    * { box-sizing: border-box; }
    
    .ms-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        color: ${CONFIG.colors.textMain};
        line-height: 1.5;
        position: absolute;
        pointer-events: auto;
        z-index: 2147483647;
    }

    /* Floating Spark Button */
    .ms-float-btn {
        position: absolute;
        width: 38px; height: 38px;
        background: ${CONFIG.colors.primary};
        color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 20px -5px rgba(80, 72, 229, 0.5);
        border: 2px solid rgba(255,255,255,0.2);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 1000;
        user-select: none;
    }
    .ms-float-btn:hover { transform: scale(1.15); border-color: white; }

    /* Main Menu */
    .ms-menu {
        position: absolute;
        background: ${CONFIG.colors.menuBg};
        border: 1px solid ${CONFIG.colors.border};
        border-radius: 12px;
        padding: 8px;
        display: none; 
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);
        min-width: 320px;
        width: 340px;
        z-index: 1000;
        animation: ms-fade-in 0.2s ease-out;
        backdrop-filter: blur(10px);
    }

    /* Header */
    .ms-header {
        padding: 4px 8px 8px;
        border-bottom: 1px solid ${CONFIG.colors.border};
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 4px;
    }
    .ms-logo { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; color: ${CONFIG.colors.textSub}; text-transform: uppercase; letter-spacing: 0.5px; }
    .ms-icon-settings { color: ${CONFIG.colors.textSub}; cursor: pointer; transition: color 0.2s; opacity: 0.7; }
    .ms-icon-settings:hover { color: white; opacity: 1; }

    /* Action Card */
    .ms-card {
        background: ${CONFIG.colors.panelBg};
        border: 1px solid ${CONFIG.colors.border};
        border-radius: 8px;
        overflow: hidden;
        transition: background 0.2s, border-color 0.2s;
    }
    .ms-card:hover { border-color: rgba(255,255,255,0.15); }

    /* Card Header */
    .ms-card-header {
        width: 100%;
        padding: 10px 12px;
        display: flex; align-items: center; gap: 10px;
        cursor: pointer;
        background: transparent;
        border: none;
        color: ${CONFIG.colors.textMain};
        text-align: left;
    }
    .ms-card-title { flex: 1; font-weight: 500; font-size: 13.5px; }
    .ms-shortcut { font-size: 11px; color: ${CONFIG.colors.textSub}; opacity: 0.5; font-family: monospace; }
    
    /* Card Body */
    .ms-card-body {
        height: 0;
        overflow: hidden;
        transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(0,0,0,0.2);
    }
    
    /* Content Styling */
    .ms-content { padding: 0 12px 12px; font-size: 13px; color: ${CONFIG.colors.textSub}; line-height: 1.6; position: relative; }
    .ms-text-block { white-space: pre-wrap; }

    /* Processing State */
    .ms-processing { display: flex; align-items: center; gap: 8px; padding: 12px; }
    .ms-dot-container { position: relative; width: 8px; height: 8px; }
    .ms-dot { width: 8px; height: 8px; background: ${CONFIG.colors.primary}; border-radius: 50%; position: absolute; }
    .ms-ping { position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${CONFIG.colors.primary}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75; }
    .ms-status-text { font-size: 11px; font-weight: 600; color: ${CONFIG.colors.primary}; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Footer / Actions */
    .ms-actions-bar {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid ${CONFIG.colors.border};
    }
    .ms-icon-btn {
        background: rgba(255,255,255,0.05);
        border: none;
        border-radius: 4px;
        width: 24px; height: 24px;
        display: flex; align-items: center; justify-content: center;
        color: ${CONFIG.colors.textSub};
        cursor: pointer;
        transition: all 0.2s;
    }
    .ms-icon-btn:hover { background: rgba(255,255,255,0.1); color: white; }
    
    /* Truncate / Show More */
    .ms-truncated .ms-text-block { mask-image: linear-gradient(to bottom, black 60%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%); }
    .ms-expand-btn {
        width: 100%; height: 20px;
        display: flex; align-items: center; justify-content: center;
        background: transparent; border: none;
        color: ${CONFIG.colors.textSub};
        cursor: pointer;
        margin-top: -10px; z-index: 10; position: relative;
    }
    .ms-expand-btn:hover { color: ${CONFIG.colors.primary}; }

    @keyframes ms-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
`;

// --- Initialization ---

function initShadowDOM() {
    // Cleanup old containers
    const old = document.getElementById('mindspark-host');
    if (old) old.remove();

    if (shadowHost) return;
    
    shadowHost = document.createElement('div');
    shadowHost.id = 'mindspark-host';
    shadowHost.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;';
    
    shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    shadowRoot.appendChild(styleEl);
    
    document.body.appendChild(shadowHost);
}

// --- Events ---

document.addEventListener('mouseup', (e) => {
    if (shadowHost && shadowHost.contains(e.target)) return;
    setTimeout(handleSelection, 50);
});

document.addEventListener('mousedown', (e) => {
    if (shadowHost && e.target !== shadowHost) hideUI();
});

// --- Logic ---

function handleSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length === 0) {
        hideUI();
        return;
    }

    if (isInteracting) return;

    initShadowDOM();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Position: Center above selection
    const x = rect.left + scrollX + (rect.width / 2);
    const y = rect.top + scrollY - 50;

    showUI(x, y, text);
}

function hideUI() {
    if (activeContainer) {
        activeContainer.remove();
        activeContainer = null;
        isInteracting = false;
    }
}

function showUI(x, y, text) {
    if (activeContainer) activeContainer.remove();

    const container = document.createElement('div');
    container.className = 'ms-container';
    
    // 1. Float Button
    const btn = document.createElement('div');
    btn.className = 'ms-float-btn';
    
    // Use icon.png
    const iconUrl = chrome.runtime.getURL('icon.png');
    btn.innerHTML = `<img src="${iconUrl}" style="width: 24px; height: 24px; display: block; border-radius: 50%; pointer-events: none;">`;
    
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.transform = 'translate(-50%, 0)';
    btn.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); };

    // 2. Menu
    const menu = document.createElement('div');
    menu.className = 'ms-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y + 45}px`;
    menu.style.transform = 'translate(-50%, 0)';
    menu.onmousedown = (e) => e.stopPropagation();

    // 2.1 Header
    const header = document.createElement('div');
    header.className = 'ms-header';
    header.innerHTML = `
        <div class="ms-logo">${ICONS.spark} MindSpark AI</div>
        <div class="ms-icon-settings">${ICONS.settings}</div>
    `;
    menu.appendChild(header);

    // 2.2 Cards
    const actions = [
        { id: 'sum', label: 'Summarize Selection', short: 'Cmd+S', icon: ICONS.summarize, prompt: 'Summarize this text in concise bullet points:' },
        { id: 'exp', label: 'Explain Selection', short: 'Cmd+E', icon: ICONS.explain, prompt: 'Explain this text simply like I am 5 years old:' },
        { id: 'fix', label: 'Fix Grammar', short: 'Cmd+G', icon: ICONS.grammar, prompt: 'Fix grammar and improve flow:' },
        { id: 'trans', label: 'Translate Selection', short: '', icon: ICONS.translate, prompt: 'Translate this text to English:' }
    ];

    actions.forEach(act => {
        menu.appendChild(createCard(act, text));
    });

    // Hover interactions
    let hideTimer;
    const cancelHide = () => { clearTimeout(hideTimer); menu.style.display = 'flex'; };
    const doHide = () => {
        if (!isInteracting) hideTimer = setTimeout(() => menu.style.display = 'none', 300);
    };

    btn.onmouseenter = cancelHide;
    btn.onmouseleave = doHide;
    menu.onmouseenter = cancelHide;
    menu.onmouseleave = doHide;

    container.appendChild(btn);
    container.appendChild(menu);
    shadowRoot.appendChild(container);
    activeContainer = container;
    activeMenu = menu;
}

function createCard(action, sourceText) {
    const card = document.createElement('div');
    card.className = 'ms-card';

    const header = document.createElement('button');
    header.className = 'ms-card-header';
    header.innerHTML = `
        ${action.icon}
        <span class="ms-card-title">${action.label}</span>
        ${action.short ? `<span class="ms-shortcut">${action.short}</span>` : ''}
    `;

    const body = document.createElement('div');
    body.className = 'ms-card-body';

    let hasRun = false;
    let isOpen = false;

    header.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            isInteracting = true; // Lock UI
            
            // Close others (Accordion behavior)
            activeMenu.querySelectorAll('.ms-card-body').forEach(b => {
                if(b !== body) b.style.height = '0px';
            });

            if (!hasRun) {
                // Show Loading
                body.style.height = 'auto';
                body.innerHTML = `
                    <div class="ms-processing">
                        <div class="ms-dot-container">
                            <span class="ms-ping"></span>
                            <span class="ms-dot"></span>
                        </div>
                        <span class="ms-status-text">Processing...</span>
                    </div>
                `;
                const h = body.scrollHeight;
                body.style.height = '0px';
                requestAnimationFrame(() => body.style.height = h + 'px');

                // Call API
                runGemini(action.prompt, sourceText).then(result => {
                    renderResult(body, result);
                    hasRun = true;
                });
            } else {
                // Re-open existing
                const wrapper = body.querySelector('.ms-content');
                const desiredH = wrapper ? wrapper.scrollHeight : 50;
                // If truncated, respect default height
                const isTrunc = wrapper && wrapper.classList.contains('ms-truncated');
                body.style.height = (isTrunc ? CONFIG.defaultHeight : desiredH) + 'px';
            }
        } else {
            body.style.height = '0px';
        }
    };

    card.appendChild(header);
    card.appendChild(body);
    return card;
}

async function runGemini(promptPrefix, text) {
    return new Promise(resolve => {
        chrome.storage.local.get(['apiKey'], async (res) => {
            if (!res.apiKey) return resolve("⚠️ Please set your API Key in the extension popup.");
            
            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'CALL_GEMINI',
                    apiKey: res.apiKey,
                    prompt: `${promptPrefix}\n\n"${text}"`
                });
                resolve(response.success ? response.data : (response.error || "Error"));
            } catch (e) {
                resolve("Connection failed.");
            }
        });
    });
}

function renderResult(container, text) {
    container.innerHTML = ''; // Clear loading
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ms-content';
    
    // Text Block
    const textBlock = document.createElement('div');
    textBlock.className = 'ms-text-block';
    textBlock.textContent = text;
    contentDiv.appendChild(textBlock);

    // Footer with Copy
    const footer = document.createElement('div');
    footer.className = 'ms-actions-bar';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'ms-icon-btn';
    copyBtn.title = "Copy to clipboard";
    copyBtn.innerHTML = ICONS.copy;
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        copyBtn.innerHTML = ICONS.check;
        setTimeout(() => copyBtn.innerHTML = ICONS.copy, 2000);
    };
    
    footer.appendChild(copyBtn);
    contentDiv.appendChild(footer);
    container.appendChild(contentDiv);

    // Measurements for Animation & Truncation
    const fullHeight = contentDiv.scrollHeight;
    
    if (fullHeight > CONFIG.defaultHeight + 20) {
        // Truncate
        container.style.height = CONFIG.defaultHeight + 'px';
        contentDiv.classList.add('ms-truncated');

        // Add Down Arrow
        const expandBtn = document.createElement('button');
        expandBtn.className = 'ms-expand-btn';
        expandBtn.innerHTML = ICONS.chevronDown;
        expandBtn.onclick = (e) => {
            e.stopPropagation();
            container.style.height = fullHeight + 'px';
            contentDiv.classList.remove('ms-truncated');
            expandBtn.remove();
        };
        
        // Insert before footer or append
        footer.appendChild(expandBtn); // Actually lets put it in footer centered?
        // Let's adjust CSS: expand btn should be separate or integrated. 
        // Design calls for "bottom arrow".
        // Let's replace the footer layout slightly.
        footer.innerHTML = '';
        footer.appendChild(copyBtn);
        // Center the arrow
        const centerWrapper = document.createElement('div');
        centerWrapper.style.flex = '1'; centerWrapper.style.display = 'flex'; centerWrapper.style.justifyContent = 'center';
        centerWrapper.appendChild(expandBtn);
        footer.appendChild(centerWrapper);
        // Spacer to balance copy btn
        footer.appendChild(document.createElement('div')); 
    } else {
        container.style.height = fullHeight + 'px';
    }
}