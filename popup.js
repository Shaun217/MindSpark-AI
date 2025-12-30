// popup.js - Vanilla JS Version

// --- DOM Elements ---
const settingsView = document.getElementById('settings-view');
const resultModal = document.getElementById('result-modal');
const modalTitle = document.getElementById('modal-title');
const resultTextarea = document.getElementById('result-textarea');
const copyBtn = document.getElementById('copy-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

const apiKeyInput = document.getElementById('api-key-input');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// --- State ---
let apiKey = '';
let currentPersona = "You are a helpful AI assistant.";

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['apiKey'], (result) => {
        if (result.apiKey) {
            apiKey = result.apiKey;
            apiKeyInput.value = apiKey;
        } else {
            showSettings();
        }
    });
});

// --- Settings Event Listeners ---
document.getElementById('open-settings-btn').addEventListener('click', showSettings);
document.getElementById('cancel-settings-btn').addEventListener('click', hideSettings);

document.getElementById('save-settings-btn').addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) return alert('Please enter a valid key');
    chrome.storage.local.set({ apiKey: key }, () => {
        apiKey = key;
        hideSettings();
        addMessage('model', 'API Key saved! Ready to help.');
    });
});

// --- Modal Event Listeners ---
closeModalBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

copyBtn.addEventListener('click', () => {
    const text = resultTextarea.value;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✅</span> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });
});

// --- Chat Event Listeners ---
sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// --- Quick Actions Logic ---
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const action = e.currentTarget.getAttribute('data-action'); // Use currentTarget to get the button, not span
        
        // Input Helpers
        if (action === 'fix_grammar') {
            userInput.value = "Fix the grammar in this text: ";
            userInput.focus();
            return;
        }
        if (action === 'translate') {
            userInput.value = "Translate this to English: ";
            userInput.focus();
            return;
        }

        // Page Content Actions (Summarize / Explain)
        const loadingId = addLoading();
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            });

            if (!results || !results[0] || !results[0].result) {
                removeLoading(loadingId);
                addMessage('model', 'Could not read page content.');
                return;
            }

            const pageText = results[0].result.substring(0, 10000); // Increased limit for Gemini
            let prompt = "";
            let title = "";

            if (action === 'summarize_page') {
                prompt = "Summarize the main points of this webpage content in bullet points:\n\n" + pageText;
                title = "📝 Page Summary";
            }
            if (action === 'explain_page') {
                prompt = "Explain the core concept of this webpage content simply:\n\n" + pageText;
                title = "🤔 Page Explanation";
            }

            // Call API
            const responseText = await getGeminiResponse(prompt);
            
            removeLoading(loadingId);
            
            // Open Result Modal
            showResultModal(title, responseText);

        } catch (err) {
            removeLoading(loadingId);
            addMessage('model', 'Error accessing page: ' + err.message);
        }
    });
});

// --- Functions ---

function showSettings() {
    settingsView.classList.remove('hidden');
}

function hideSettings() {
    settingsView.classList.add('hidden');
}

function showResultModal(title, content) {
    modalTitle.textContent = title;
    resultTextarea.value = content;
    resultModal.classList.remove('hidden');
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';

    const loadingId = addLoading();
    try {
        const reply = await getGeminiResponse(text);
        removeLoading(loadingId);
        addMessage('model', reply);
    } catch (error) {
        removeLoading(loadingId);
        addMessage('model', 'Error: ' + error.message);
    }
}

function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.textContent = text;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'loading';
    div.textContent = 'MindSpark is thinking...';
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// Core API Logic
async function getGeminiResponse(prompt) {
    if (!apiKey) {
        showSettings();
        throw new Error("API Key missing");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{ text: currentPersona + "\n\n" + prompt }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    } else if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    } else {
        return "No response received from Gemini.";
    }
}