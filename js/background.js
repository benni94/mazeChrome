const maxLevel = 8;

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
      path: "sidepanel.html",
    });
  }
});

// Add this to your background.js file

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "levelCompleted" && message.level === maxLevel) {
    // Stop the timer when level maxLevel is completed
    chrome.storage.local.get(["timerStartTime"], (data) => {
      if (data.timerStartTime) {
        const endTime = Date.now();
        const totalTime = endTime - data.timerStartTime;

        // Store the completion time and set timer as stopped
        chrome.storage.local.set({
          timerRunning: false,
          level2CompletionTime: totalTime,
          levelCompletionTimeFormatted: formatTime(totalTime),
        });
      }
    });
  }
});

// Helper function to format time
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`;
}
