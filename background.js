// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mindspark-summarize",
    title: "Summarize with MindSpark",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Optional: Add logic to handle right-click context menu events here
    // Currently, the main interaction is via the popup or floating button.
});