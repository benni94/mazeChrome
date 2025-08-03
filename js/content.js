const maxLevel = 1;

function extractLevel(text) {
  const match = text.match(/level (\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

const observer = new MutationObserver(() => {
  const dialog = document.getElementById("dialogDone");
  if (dialog && dialog.style.display !== "none") {
    const levelText = document.getElementById("dialogDoneText")?.innerText;
    const codeBlock = document.getElementById("containerCode")?.innerText;

    if (codeBlock) {
      const lines = codeBlock.trim().split("\n").filter(Boolean);
      const functionCounts = {};

      for (const line of lines) {
        const match = line.match(/(\w+)\s*\(/);
        if (match) {
          const func = match[1];
          functionCounts[func] = (functionCounts[func] || 0) + 1;
        }
      }

      const data = {
        level: extractLevel(levelText),
        code: codeBlock,
        lineCount: lines.length,
        functionCounts,
      };

      // Save current level data
      chrome.storage.local.set({ lastMazeData: data });

      // Update total counts
      chrome.storage.local.get("totalFunctionCounts", (result) => {
        let totalCounts = result.totalFunctionCounts || {};

        // Add current level counts to totals
        for (const [func, count] of Object.entries(functionCounts)) {
          totalCounts[func] = (totalCounts[func] || 0) + count;
        }

        // Save updated totals
        chrome.storage.local.set({ totalFunctionCounts: totalCounts });
      });

      if (levelText && codeBlock) {
        // Check if this is a level completion message
        if (isLevelCompletionMessage(levelText)) {
          // Extract the next level number (current level + 1)
          const nextLevel = extractNextLevel(levelText);
          const currentLevel = nextLevel - 1;

          if (currentLevel === maxLevel) {
            // Send message to stop the timer
            chrome.runtime.sendMessage({
              action: "levelCompleted",
              level: currentLevel,
              code: codeBlock,
            });
          }
        }
      }
    }
  }
});

// Function to check if this is a level completion message
function isLevelCompletionMessage(text) {
  // In German, the completion message contains "Bist du bereit für Level X?"
  return text.includes("bereit für Level") || text.includes("ready for level"); // English version
}

// Function to extract the next level number from text
function extractNextLevel(text) {
  // For German: "Bist du bereit für Level 3?"
  const match = text.match(/Level\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

// helper function to format time
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

observer.observe(document.body, { childList: true, subtree: true });

// Function to clear all data and reset the game
function clearAllData() {
  // Clear localStorage in the Blockly Maze page
  window.localStorage.clear();
  console.log("Blockly Maze localStorage cleared from content.js");

  // Navigate to level 1 (reset the game)
  window.location.href = "https://blockly.games/maze?lang=de&level=1";
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content.js:", message);

  if (message.action === "clearAllData") {
    clearAllData();
    sendResponse({ status: "success", message: "Data cleared and game reset" });
    return true; // Keep the message channel open for the async response
  }
});
