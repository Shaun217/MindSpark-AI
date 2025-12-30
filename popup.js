// popup.js - Vanilla JS Version

// --- DOM Elements ---
const settingsView = document.getElementById('settings-view');
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

// --- Event Listeners ---
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

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// Handle Quick Actions
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const action = e.target.getAttribute('data-action');
        
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

        // For page actions (Summarize/Explain)
        const loadingId = addLoading();
        try {
            // Get page content
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Execute script safely
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText
            });

            if (!results || !results[0] || !results[0].result) {
                removeLoading(loadingId);
                addMessage('model', 'Could not read page content.');
                return;
            }

            const pageText = results[0].result.substring(0, 5000); // Limit context
            let prompt = "";
            if (action === 'summarize_page') prompt = "Summarize the main points of this text in bullet points:\n\n" + pageText;
            if (action === 'explain_page') prompt = "Explain the core concept of this text simply:\n\n" + pageText;

            await callGemini(prompt, loadingId);

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

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';

    const loadingId = addLoading();
    await callGemini(text, loadingId);
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

// Direct Fetch to Gemini API (No SDK needed)
async function callGemini(prompt, loadingId) {
    if (!apiKey) {
        removeLoading(loadingId);
        addMessage('model', 'Please set your API Key in settings first.');
        showSettings();
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
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
        removeLoading(loadingId);

        if (data.error) {
            addMessage('model', 'API Error: ' + data.error.message);
        } else if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            addMessage('model', reply);
        } else {
            addMessage('model', 'No response received.');
        }

    } catch (error) {
        removeLoading(loadingId);
        addMessage('model', 'Network Error: ' + error.message);
    }
}