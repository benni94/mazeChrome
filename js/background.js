// When the extension icon is clicked, open the sidepanel
chrome.action.onClicked.addListener(async (tab) => {
    // Open the sidepanel
    if (chrome.sidePanel) {
        await chrome.sidePanel.open({ tabId: tab.id });
    }
});

// Open sidepanel when extension is loaded
chrome.runtime.onInstalled.addListener(() => {
    // Set the default sidepanel
    if (chrome.sidePanel) {
        chrome.sidePanel.setOptions({
            enabled: true,
            path: 'sidepanel.html'
        });
    }
});