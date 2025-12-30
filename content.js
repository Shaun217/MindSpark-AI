// content.js - Pure JS with Shadow DOM

let shadowHost = null;
let shadowRoot = null;
let activeContainer = null;
let activeMenu = null;
let floatBtn = null;
let isInteracting = false; // Keeps track if user is interacting with results

// Configuration
const DEFAULT_RESULT_HEIGHT = 120; // px

// Icons
const ICONS = {
    spark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>`,
    copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    summarize: '📝',
    explain: '🤔',
    translate: '🌐',
    grammar: '✍️'
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
        pointer-events: auto;
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

    /* Main Menu Container */
    .ms-menu {
        position: absolute;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 0;
        display: none; /* Hidden by default */
        flex-direction: column;
        box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5);
        min-width: 320px;
        max-width: 400px;
        width: 340px;
        z-index: 1000;
        overflow: hidden;
        animation: ms-fade-in 0.15s ease-out;
    }

    /* Action Item (Accordion Row) */
    .ms-item {
        border-bottom: 1px solid #334155;
        background: #1e293b;
    }
    .ms-item:last-child { border-bottom: none; }

    /* Header */
    .ms-item-header {
        padding: 10px 14px;
        display: flex; justify-content: space-between; align-items: center;
        cursor: pointer;
        transition: background 0.1s;
        user-select: none;
    }
    .ms-item-header:hover { background: #334155; }
    
    .ms-item-label { display: flex; align-items: center; gap: 10px; font-weight: 500; color: #cbd5e1; }
    .ms-item-toggle { 
        color: #64748b; 
        transition: transform 0.2s; 
        display: flex; align-items: center;
    }
    
    /* Expanded State */
    .ms-item.expanded .ms-item-toggle { transform: rotate(180deg); color: #818cf8; }
    .ms-item.expanded .ms-item-header { background: #283046; }
    .ms-item.expanded .ms-item-label { color: white; }

    /* Result Body */
    .ms-item-body {
        height: 0;
        overflow: hidden;
        background: #0f172a;
        transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }

    .ms-content-wrapper {
        padding: 12px;
    }

    .ms-result-text {
        font-size: 13.5px;
        line-height: 1.6;
        color: #e2e8f0;
        white-space: pre-wrap;
    }

    /* Actions inside Result */
    .ms-result-actions {
        display: flex; justify-content: flex-end; gap: 8px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed #334155;
    }

    .ms-mini-btn {
        background: transparent;
        border: 1px solid #334155;
        color: #94a3b8;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        display: flex; align-items: center; gap: 4px;
        transition: all 0.1s;
    }
    .ms-mini-btn:hover { background: #334155; color: white; }
    .ms-mini-btn.copied { background: #059669; border-color: #059669; color: white; }

    /* Show More Overlay */
    .ms-show-more-overlay {
        position: absolute; bottom: 0; left: 0; width: 100%;
        height: 40px;
        background: linear-gradient(transparent, #0f172a);
        display: flex; justify-content: center; align-items: flex-end;
        padding-bottom: 5px;
        pointer-events: none; /* Let clicks pass through if needed, but button needs pointer events */
    }
    .ms-expand-trigger {
        pointer-events: auto;
        background: #1e293b;
        border: 1px solid #4f46e5;
        color: #818cf8;
        font-size: 10px;
        padding: 2px 10px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        margin-bottom: 4px;
    }
    .ms-expand-trigger:hover { background: #4f46e5; color: white; }

    /* Loading */
    .ms-loading { padding: 15px; display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 13px; }
    .ms-spinner { width: 14px; height: 14px; border: 2px solid #334155; border-top-color: #818cf8; border-radius: 50%; animation: ms-spin 0.8s linear infinite; }

    @keyframes ms-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ms-spin { to { transform: rotate(360deg); } }
`;

// --- Initialization ---

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

// --- Event Listeners ---

document.addEventListener('mouseup', (e) => {
    if (shadowHost && shadowHost.contains(e.target)) return;
    setTimeout(handleSelection, 50);
});

document.addEventListener('mousedown', (e) => {
    // If clicking outside the shadow host, close UI
    if (shadowHost && e.target !== shadowHost) {
        hideUI();
    }
});

// --- Logic ---

function handleSelection() {
    // If user has expanded any item, we consider them "interacting" and don't close on new selection instantly
    // unless the selection is empty (clicking away).
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length === 0) {
        hideUI();
        return;
    }

    if (isInteracting) return; // Don't move the button if we are busy with a result

    initShadowDOM();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const x = rect.left + scrollX + (rect.width / 2);
    const y = rect.top + scrollY - 45;

    showUI(x, y, text);
}

function hideUI() {
    if (activeContainer) {
        activeContainer.remove();
        activeContainer = null;
        activeMenu = null;
        floatBtn = null;
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
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.innerHTML = ICONS.spark;
    btn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault(); };

    // 2. Menu Container
    const menu = document.createElement('div');
    menu.className = 'ms-menu';
    // Center logic
    menu.style.left = `${x}px`;
    menu.style.top = `${y + 45}px`;
    menu.style.transform = 'translateX(-50%)'; 
    menu.onmousedown = (e) => { e.stopPropagation(); }; // Prevent clicks in menu from closing UI

    // 3. Define Actions
    const actions = [
        { id: 'sum', label: 'Summarize', icon: ICONS.summarize, prompt: 'Summarize this text in concise bullet points:' },
        { id: 'exp', label: 'Explain', icon: ICONS.explain, prompt: 'Explain this text simply like I am 5 years old:' },
        { id: 'trans', label: 'Translate', icon: ICONS.translate, prompt: 'Translate this text to English:' },
        { id: 'fix', label: 'Fix Grammar', icon: ICONS.grammar, prompt: 'Fix grammar and improve flow:' }
    ];

    // 4. Build Accordion Items
    actions.forEach(act => {
        const item = createActionItem(act, text);
        menu.appendChild(item);
    });

    // 5. Hover Logic
    let hideTimeout;
    const openMenu = () => {
        clearTimeout(hideTimeout);
        menu.style.display = 'flex';
        // Reposition if offscreen right/left
        // (Simple boundary check could be added here)
    };
    const closeMenu = () => {
        if (!isInteracting) { // Only hide if no result is expanded
            hideTimeout = setTimeout(() => {
                menu.style.display = 'none';
            }, 300);
        }
    };

    btn.onmouseenter = openMenu;
    btn.onmouseleave = closeMenu;
    menu.onmouseenter = openMenu;
    menu.onmouseleave = closeMenu;

    container.appendChild(btn);
    container.appendChild(menu);
    shadowRoot.appendChild(container);
    
    activeContainer = container;
    activeMenu = menu;
    floatBtn = btn;
}

function createActionItem(action, sourceText) {
    const item = document.createElement('div');
    item.className = 'ms-item';

    // Header
    const header = document.createElement('div');
    header.className = 'ms-item-header';
    header.innerHTML = `
        <div class="ms-item-label">
            <span>${action.icon}</span> ${action.label}
        </div>
        <div class="ms-item-toggle">
            ${ICONS.chevronDown}
        </div>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'ms-item-body';
    
    // State Tracking
    let hasRun = false;
    let isExpanded = false;

    // Click Handler
    header.onclick = () => {
        isExpanded = !isExpanded;
        
        // Toggle UI
        if (isExpanded) {
            item.classList.add('expanded');
            isInteracting = true; // Lock UI open
            
            if (!hasRun) {
                // First run: Show loading and call API
                body.style.height = 'auto'; // Temp to show loading
                body.innerHTML = `
                    <div class="ms-loading">
                        <div class="ms-spinner"></div>
                        <span>MindSpark is thinking...</span>
                    </div>
                `;
                // Set height to actual for transition
                const loadingHeight = body.scrollHeight;
                body.style.height = '0px';
                requestAnimationFrame(() => body.style.height = loadingHeight + 'px');

                runGeminiAction(action.prompt, sourceText, body).then(() => {
                    hasRun = true;
                });
            } else {
                // Just expand (height will be set by content wrapper)
                const wrapper = body.querySelector('.ms-content-wrapper');
                if (wrapper) {
                     // Check "Show More" state logic
                     const isTruncated = wrapper.dataset.truncated === 'true';
                     const naturalHeight = wrapper.scrollHeight;
                     const targetHeight = isTruncated ? DEFAULT_RESULT_HEIGHT : naturalHeight;
                     body.style.height = targetHeight + 'px';
                }
            }
        } else {
            item.classList.remove('expanded');
            body.style.height = '0px';
            
            // If all items are collapsed, we allow auto-hide again
            const anyExpanded = activeMenu.querySelector('.ms-item.expanded');
            if (!anyExpanded) isInteracting = false;
        }
    };

    item.appendChild(header);
    item.appendChild(body);
    return item;
}

async function runGeminiAction(promptPrefix, text, bodyContainer) {
    // API Call
    return new Promise(resolve => {
        chrome.storage.local.get(['apiKey'], async (result) => {
            if (!result.apiKey) {
                renderError(bodyContainer, "API Key missing. Settings > Extension.");
                resolve();
                return;
            }

            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'CALL_GEMINI',
                    apiKey: result.apiKey,
                    prompt: `${promptPrefix}\n\n"${text}"`
                });

                if (response && response.success) {
                    renderResultContent(bodyContainer, response.data);
                } else {
                    renderError(bodyContainer, response.error || "Error generating response.");
                }
            } catch (e) {
                renderError(bodyContainer, "Connection error.");
            }
            resolve();
        });
    });
}

function renderResultContent(container, text) {
    // Clear loading
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'ms-content-wrapper';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'ms-result-text';
    textDiv.textContent = text;
    
    // Actions (Copy)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'ms-result-actions';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'ms-mini-btn';
    copyBtn.innerHTML = `${ICONS.copy} Copy`;
    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        copyBtn.innerHTML = `✅ Copied`;
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.innerHTML = `${ICONS.copy} Copy`;
            copyBtn.classList.remove('copied');
        }, 2000);
    };

    actionsDiv.appendChild(copyBtn);
    wrapper.appendChild(textDiv);
    wrapper.appendChild(actionsDiv);
    container.appendChild(wrapper);

    // Height Calculation Logic
    // We need to append to DOM to measure, but container is visible (height auto or animating)
    // Actually container height is currently fixed to loading height.
    
    // Let's perform height check
    const naturalHeight = wrapper.getBoundingClientRect().height; // Won't work if parent height is constrained/animating 
    
    // Force allow measuring
    const prevHeight = container.style.height;
    container.style.height = 'auto';
    const realHeight = container.scrollHeight;
    
    if (realHeight > DEFAULT_RESULT_HEIGHT + 20) { // +20 buffer
        // Truncate mode
        container.style.height = DEFAULT_RESULT_HEIGHT + 'px';
        wrapper.dataset.truncated = 'true';
        
        // Add Overlay
        const overlay = document.createElement('div');
        overlay.className = 'ms-show-more-overlay';
        
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'ms-expand-trigger';
        showMoreBtn.innerText = 'Show All';
        showMoreBtn.onclick = (e) => {
            e.stopPropagation();
            container.style.height = realHeight + 'px';
            overlay.remove();
            wrapper.dataset.truncated = 'false';
        };
        
        overlay.appendChild(showMoreBtn);
        container.appendChild(overlay);
    } else {
        // Fit content
        container.style.height = realHeight + 'px';
    }
}

function renderError(container, msg) {
    container.innerHTML = `
        <div style="padding: 12px; color: #ef4444; font-size: 13px;">${msg}</div>
    `;
    container.style.height = container.scrollHeight + 'px';
}
