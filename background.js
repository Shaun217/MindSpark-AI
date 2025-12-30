// background.js

// Handle messages from Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CALL_GEMINI') {
        handleGeminiCall(request.prompt, request.apiKey)
            .then(text => sendResponse({ success: true, data: text }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        
        return true; // Keep the message channel open for async response
    }
});

async function handleGeminiCall(prompt, apiKey) {
    if (!apiKey) throw new Error("API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    // Default system instruction
    const systemInstruction = "You are a helpful assistant. Be concise. Format output in Markdown if helpful.";

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        config: { systemInstruction: { parts: [{ text: systemInstruction }] } }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }
    
    if (data.candidates && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error("No response generated.");
}

// Context Menu Setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "mindspark-summarize",
        title: "Summarize with MindSpark",
        contexts: ["selection"]
    });
});
