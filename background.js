// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'CALL_GEMINI') {
        handleGeminiCall(request.prompt, request.apiKey)
            .then(text => sendResponse({ success: true, data: text }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        
        return true; // Keep channel open
    }
});

async function handleGeminiCall(prompt, apiKey) {
    if (!apiKey) throw new Error("API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
            systemInstruction: { parts: [{ text: "You are a helpful assistant. Be concise. Format output in Markdown." }] } 
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) throw new Error(data.error.message || "Gemini API Error");
        
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error("No response generated.");
    } catch (error) {
        throw error;
    }
}
