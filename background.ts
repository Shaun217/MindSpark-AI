declare var chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu items
  chrome.contextMenus.create({
    id: "mindspark-summarize",
    title: "Summarize with MindSpark AI",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "mindspark-explain",
    title: "Explain selection",
    contexts: ["selection"]
  });
});

// We can handle context menu clicks here if we wanted to open the popup,
// but opening the popup programmatically is restricted. 
// Instead, we could send a message to the content script to show the floating UI
// or open the side panel (if sidePanel permission was used).
chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
  if (info.menuItemId === "mindspark-summarize" || info.menuItemId === "mindspark-explain") {
      // In a full implementation, pass this to the sidepanel or content script
      console.log("Context menu clicked:", info.selectionText);
      // For now, we rely on the Content Script's floating UI for interaction
  }
});