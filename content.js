// content.js - Pure JS

let floatBtn = null;
let menu = null;

document.addEventListener('mouseup', (e) => {
    // Wait a bit for selection to settle
    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            showButton(rect.left + window.scrollX + rect.width / 2, rect.top + window.scrollY - 40, text);
        } else {
            // Hide if clicking elsewhere
            if (menu && !menu.contains(e.target) && floatBtn && !floatBtn.contains(e.target)) {
                hideUI();
            }
        }
    }, 100);
});

function hideUI() {
    if (floatBtn) floatBtn.remove();
    if (menu) menu.remove();
    floatBtn = null;
    menu = null;
}

function showButton(x, y, text) {
    hideUI(); // Clear existing

    // Create Main Button
    floatBtn = document.createElement('div');
    floatBtn.textContent = '✨';
    floatBtn.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${x}px;
        background: #4f46e5;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 16px;
        user-select: none;
    `;

    document.body.appendChild(floatBtn);

    // Create Menu (Hidden initially)
    menu = document.createElement('div');
    menu.style.cssText = `
        position: absolute;
        top: ${y + 35}px;
        left: ${x}px;
        transform: translateX(-50%);
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 5px;
        display: none;
        flex-direction: column;
        gap: 5px;
        z-index: 10000;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        min-width: 150px;
    `;

    // Menu Actions
    const actions = [
        { label: '📝 Summarize', prompt: 'Summarize this in one sentence:' },
        { label: '🤔 Explain', prompt: 'Explain this simply:' },
        { label: '🌐 Translate', prompt: 'Translate this to English:' }
    ];

    actions.forEach(act => {
        const btn = document.createElement('button');
        btn.textContent = act.label;
        btn.style.cssText = `
            background: transparent;
            border: none;
            color: #cbd5e1;
            padding: 8px;
            text-align: left;
            cursor: pointer;
            font-size: 12px;
            border-radius: 4px;
        `;
        btn.onmouseover = () => btn.style.background = '#334155';
        btn.onmouseout = () => btn.style.background = 'transparent';
        
        btn.onclick = () => {
            handleAction(act.prompt, text, menu);
        };
        
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);

    // Hover Events
    floatBtn.onmouseenter = () => menu.style.display = 'flex';
    menu.onmouseleave = () => menu.style.display = 'none';
}

async function handleAction(promptPrefix, text, menuContainer) {
    menuContainer.innerHTML = '<div style="color:#94a3b8; padding:10px; font-size:12px;">Thinking...</div>';
    
    // Get API Key
    chrome.storage.local.get(['apiKey'], async (result) => {
        const apiKey = result.apiKey;
        if (!apiKey) {
            menuContainer.innerHTML = '<div style="color:#f87171; padding:10px; font-size:12px;">Please add API Key in extension popup.</div>';
            return;
        }

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${promptPrefix} "${text}"` }] }]
                })
            });
            const data = await response.json();
            
            if(data.candidates && data.candidates[0].content) {
                const result = data.candidates[0].content.parts[0].text;
                menuContainer.innerHTML = `<div style="color:#e2e8f0; padding:10px; font-size:12px; max-height:200px; overflow-y:auto;">${result}</div>`;
            } else {
                menuContainer.innerHTML = '<div style="color:#f87171; padding:10px; font-size:12px;">No response.</div>';
            }

        } catch (e) {
            menuContainer.innerHTML = '<div style="color:#f87171; padding:10px; font-size:12px;">Error.</div>';
        }
    });
}