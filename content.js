// content.js - Pure JS

let floatBtn = null;
let menu = null;

// Styles injected via JS to ensure isolation and ease of use without build steps
const STYLES = {
    btn: `
        position: absolute;
        width: 36px; height: 36px;
        background: #4f46e5;
        color: white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        z-index: 2147483647;
        box-shadow: 0 4px 10px rgba(79, 70, 229, 0.4);
        font-size: 18px;
        transition: transform 0.2s, background 0.2s;
        border: 2px solid white;
    `,
    menu: `
        position: absolute;
        transform: translateX(-50%);
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 6px;
        display: none;
        flex-direction: column;
        gap: 4px;
        z-index: 2147483647;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        min-width: 160px;
        animation: fadeIn 0.2s ease-out;
    `,
    resultCard: `
        position: absolute;
        transform: translateX(-50%);
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        z-index: 2147483647;
        box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.5);
        width: 320px;
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `,
    actionBtn: `
        background: transparent;
        border: none;
        color: #e2e8f0;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        font-size: 13px;
        border-radius: 6px;
        display: flex; align-items: center; gap: 8px;
        font-family: -apple-system, sans-serif;
        transition: background 0.1s;
    `,
    textarea: `
        width: 100%;
        min-height: 150px;
        max-height: 300px;
        background: #0f172a;
        color: #e2e8f0;
        border: none;
        padding: 12px;
        resize: vertical;
        outline: none;
        font-family: -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        box-sizing: border-box;
    `,
    header: `
        padding: 12px;
        background: #1e293b;
        border-bottom: 1px solid #334155;
        display: flex; justify-content: space-between; align-items: center;
        color: #818cf8; font-weight: 600; font-family: sans-serif; font-size: 14px;
    `,
    footer: `
        padding: 10px;
        background: #1e293b;
        border-top: 1px solid #334155;
        display: flex; gap: 8px; justify-content: flex-end;
    `,
    primaryBtn: `
        background: #4f46e5; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: sans-serif;
    `
};

// Add keyframe animations to document
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(5px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
`;
document.head.appendChild(styleSheet);

document.addEventListener('mouseup', (e) => {
    // Avoid closing if clicking inside our own UI
    if (menu && menu.contains(e.target)) return;
    if (floatBtn && floatBtn.contains(e.target)) return;

    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            // Position: Center horizontally, above text vertically
            const x = rect.left + window.scrollX + rect.width / 2;
            const y = rect.top + window.scrollY - 45;
            createFloatingButton(x, y, text);
        } else {
            hideUI();
        }
    }, 100);
});

function hideUI() {
    if (floatBtn) { floatBtn.remove(); floatBtn = null; }
    if (menu) { menu.remove(); menu = null; }
}

function createFloatingButton(x, y, text) {
    if (floatBtn) hideUI();

    floatBtn = document.createElement('div');
    floatBtn.innerHTML = '✨'; // Sparkle icon
    floatBtn.style.cssText = STYLES.btn + `top: ${y}px; left: ${x}px;`;
    
    floatBtn.onmouseover = () => { floatBtn.style.transform = "scale(1.1)"; };
    floatBtn.onmouseout = () => { floatBtn.style.transform = "scale(1)"; };

    document.body.appendChild(floatBtn);

    // Initial Menu (Hidden)
    menu = document.createElement('div');
    menu.style.cssText = STYLES.menu + `top: ${y + 40}px; left: ${x}px;`;

    const actions = [
        { icon: '📝', label: 'Summarize', prompt: 'Summarize this selection in 2 sentences:' },
        { icon: '🤔', label: 'Explain', prompt: 'Explain this selection simply:' },
        { icon: '🌐', label: 'Translate', prompt: 'Translate this selection to English:' }
    ];

    actions.forEach(act => {
        const btn = document.createElement('button');
        btn.innerHTML = `<span>${act.icon}</span> ${act.label}`;
        btn.style.cssText = STYLES.actionBtn;
        
        btn.onmouseover = () => btn.style.backgroundColor = '#334155';
        btn.onmouseout = () => btn.style.backgroundColor = 'transparent';
        
        btn.onclick = (e) => {
            e.stopPropagation(); // Prevent document click from closing
            handleAction(act.prompt, text, act.label);
        };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // Show menu on hover of button
    floatBtn.onmouseenter = () => { menu.style.display = 'flex'; };
    // Keep menu open if moving mouse to it
    menu.onmouseleave = () => { 
        // Only hide if we aren't in "Result Mode" (which changes the DOM ID/Structure)
        if(menu.dataset.mode !== 'result') {
            menu.style.display = 'none'; 
        }
    };
}

async function handleAction(promptPrefix, text, title) {
    // 1. Transform Menu into Result Card
    menu.dataset.mode = 'result'; // Prevent mouseleave closing
    menu.style.cssText = STYLES.resultCard + `top: ${parseInt(menu.style.top)}px; left: ${menu.style.left};`;
    
    // 2. Show Loading State
    menu.innerHTML = `
        <div style="padding: 20px; color: #94a3b8; text-align: center; font-family: sans-serif; font-size: 14px;">
            ✨ MindSpark is thinking...
        </div>
    `;

    // 3. Get API Key & Call Gemini
    chrome.storage.local.get(['apiKey'], async (result) => {
        const apiKey = result.apiKey;
        if (!apiKey) {
            renderError('Please set your API Key in the extension popup.');
            return;
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${promptPrefix} "${text}"` }] }]
                })
            });
            const data = await response.json();
            
            if(data.candidates && data.candidates[0].content) {
                renderResult(title, data.candidates[0].content.parts[0].text);
            } else {
                renderError('No valid response received.');
            }

        } catch (e) {
            renderError('Connection Error: ' + e.message);
        }
    });
}

function renderResult(title, content) {
    // Reconstruct inner HTML for the Result Card
    menu.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.style.cssText = STYLES.header;
    header.innerHTML = `<span>${title}</span>`;
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '20px';
    closeBtn.onclick = hideUI;
    header.appendChild(closeBtn);
    menu.appendChild(header);

    // Textarea (Editable)
    const textarea = document.createElement('textarea');
    textarea.style.cssText = STYLES.textarea;
    textarea.value = content;
    menu.appendChild(textarea);

    // Footer with Actions
    const footer = document.createElement('div');
    footer.style.cssText = STYLES.footer;

    const copyBtn = document.createElement('button');
    copyBtn.innerText = 'Copy';
    copyBtn.style.cssText = STYLES.primaryBtn;
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(textarea.value);
        copyBtn.innerText = 'Copied!';
        copyBtn.style.backgroundColor = '#059669'; // Green
        setTimeout(() => {
            copyBtn.innerText = 'Copy';
            copyBtn.style.backgroundColor = '#4f46e5';
        }, 2000);
    };

    footer.appendChild(copyBtn);
    menu.appendChild(footer);
}

function renderError(msg) {
    menu.innerHTML = `
        <div style="padding: 15px; color: #f87171; font-family: sans-serif; font-size: 13px;">
            ${msg}
        </div>
        <div style="padding: 10px; border-top: 1px solid #334155; text-align: right;">
            <button id="close-err-btn" style="${STYLES.primaryBtn} background: #334155;">Close</button>
        </div>
    `;
    document.getElementById('close-err-btn').onclick = hideUI;
}