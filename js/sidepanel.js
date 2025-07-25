const maxLevel = 2;

const mazeLevel1Url = "https://blockly.games/maze?lang=de&level=1";

let timerInterval;
let startTime;
let timerRunning = false;

// Function to check URL and hide div if needed
function checkUrlAndHideDiv() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (
      currentTab &&
      currentTab.url &&
      currentTab.url.startsWith("https://blockly.games")
    ) {
      // Only hide the link to Blockly Games, not the timer
      const blocklyLink = document.querySelector("div.bottomWrapper > a");
      if (blocklyLink) {
        blocklyLink.style.display = "none";
      }
    } else {
      // Show the link if not on Blockly Games
      const blocklyLink = document.querySelector("div.bottomWrapper > a");
      if (blocklyLink) {
        blocklyLink.style.display = "block";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Initial check
  checkUrlAndHideDiv();

  setInterval(checkUrlAndHideDiv, 500);

  chrome.storage.local.get("lastMazeData", (data) => {
    const info = data.lastMazeData;

    if (!info) {
      document.getElementById("mazeCode").textContent = "No data yet.";
      return;
    }

    document.getElementById("level").textContent = info.level
      ? `Level ${info.level}`
      : "Level unknown";

    document.getElementById(
      "lineCount"
    ).textContent = `Lines used: ${info.lineCount}`;

    document.getElementById("mazeCode").textContent = info.code;
  });

  // Add event listener for the clear button
  const clearButton = document.getElementById("clearData");
  if (clearButton) {
    clearButton.addEventListener("click", showConfirmationModal);
  }

  // Add event listeners for the confirmation modal buttons
  const cancelButton = document.getElementById("cancelClear");
  if (cancelButton) {
    cancelButton.addEventListener("click", hideConfirmationModal);
  }

  // Check if timer is already running (in case of refresh)
  chrome.storage.local.get(["timerRunning", "timerStartTime"], (data) => {
    if (data.timerRunning) {
      timerRunning = true;
      startTime = data.timerStartTime;
      startTimer();
    }
  });

  const confirmButton = document.getElementById("confirmClear");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      hideConfirmationModal();
      clearAllData();
    });
  }

  // Add event listener for the homeAndClear button
  const homeAndClearButton = document.getElementById("homeAndClear");
  if (homeAndClearButton) {
    homeAndClearButton.addEventListener(
      "click",
      showConfirmationModalForHomeAndClear
    );
  }

  // Add event listener for the start maze timer button
  const startMazeTimerButton = document.getElementById("startMazeTimer");
  if (startMazeTimerButton) {
    startMazeTimerButton.addEventListener("click", startMazeWithTimer);
  }
});

// Function to start the maze with timer
function startMazeWithTimer() {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const currentTab = tabs[0];

      // Update the current tab to navigate to the maze
      chrome.tabs.update(currentTab.id, { url: mazeLevel1Url }, (tab) => {
        // Start the timer
        startTime = Date.now();
        startTimer();

        // Save timer state
        chrome.storage.local.set({
          timerRunning: true,
          timerStartTime: startTime,
        });

        // Hide the button
        document.getElementById("startMazeTimer").style.display = "none";
        document.getElementById("timerDisplay").style.display = "block";
      });
    } else {
      // Fallback to creating a new tab if no active tab is found
      chrome.tabs.create({ url: mazeLevel1Url }, (_) => {
        // Start the timer
        startTime = Date.now();
        startTimer();

        // Save timer state
        chrome.storage.local.set({
          timerRunning: true,
          timerStartTime: startTime,
        });

        // Hide the button
        document.getElementById("startMazeTimer").style.display = "none";
        document.getElementById("timerDisplay").style.display = "block";
      });
    }
  });
}

// Function to start the timer
function startTimer() {
  console.log("Starting timer");
  timerRunning = true;

  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Start a new interval
  timerInterval = setInterval(updateTimer, 50);
}

// Function to update the timer display
function updateTimer() {
  if (!timerRunning) {
    console.log("Timer not running, clearing interval");
    clearInterval(timerInterval);
    timerInterval = null;
    return;
  }

  const currentTime = Date.now();

  if (!startTime) {
    // Try to get startTime from storage
    chrome.storage.local.get(["timerStartTime"], (data) => {
      if (data.timerStartTime) {
        startTime = data.timerStartTime;
      } else {
        console.log("No start time available, stopping timer");
        stopTimer();
      }
    });
    return;
  }

  const elapsedTime = currentTime - startTime;

  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  const milliseconds = elapsedTime % 1000;

  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
    .toString()
    .padStart(3, "0")}`;

  document.getElementById("timerValue").textContent = timeString;
}

// Function to stop the timer
function stopTimer() {
  console.log("Stopping timer");

  // Clear the interval
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reset timer state
  timerRunning = false;
  startTime = null;

  // Update storage
  chrome.storage.local.set({
    timerRunning: false,
  });

  // Update the UI
  document.getElementById("startMazeTimer").style.display = "block";
}

// Function to show the confirmation modal
function showConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

// Function to show the confirmation modal for homeAndClear
function showConfirmationModalForHomeAndClear() {
  // Update the modal text for this specific action
  const modalText = document.querySelector("#confirmationModal p");
  if (modalText) {
    modalText.textContent =
      "Are you sure you want to clear all data and go to the homepage?";
  }

  // Change the confirm button action
  const confirmButton = document.getElementById("confirmClear");
  if (confirmButton) {
    // Remove previous event listeners
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

    // Add new event listener
    newConfirmButton.addEventListener("click", () => {
      hideConfirmationModal();
      goHomeAndClear();
    });
  }

  // Show the modal
  showConfirmationModal();
}

// Function to hide the confirmation modal
function hideConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  if (modal) {
    modal.style.display = "none";

    // Reset the modal text to default
    setTimeout(() => {
      const modalText = document.querySelector("#confirmationModal p");
      if (modalText) {
        modalText.textContent = "Are you sure you want to clear all data?";
      }

      // Reset the confirm button action
      const confirmButton = document.getElementById("confirmClear");
      if (confirmButton) {
        // Remove previous event listeners
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

        // Add default event listener
        newConfirmButton.addEventListener("click", () => {
          hideConfirmationModal();
          clearAllData();
        });
      }
    }, 300);
  }
}

// Function to clear all data
function clearAllData() {
  console.log("Clearing all data in sidepanel.js");

  // Stop the timer first
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reset timer state variables
  timerRunning = false;
  startTime = null;

  // Check if we're clearing after a successful send
  const isAfterSuccessfulSend =
    document.getElementById("sendButton").style.display === "block";

  // Clear extension storage data
  chrome.storage.local.set(
    {
      lastMazeData: null,
      totalFunctionCounts: {},
      timerRunning: false,
      timerStartTime: null,
      // Don't clear these if we just sent data successfully
      level2CompletionTime: isAfterSuccessfulSend ? null : null,
      levelCompletionTimeFormatted: isAfterSuccessfulSend ? null : null,
    },
    () => {
      // Update the UI to reflect cleared data
      const mazeCodeElement = document.getElementById("mazeCode");
      if (mazeCodeElement) mazeCodeElement.textContent = "No data yet.";

      const levelElement = document.getElementById("level");
      if (levelElement) levelElement.textContent = "Level unknown";

      const lineCountElement = document.getElementById("lineCount");
      if (lineCountElement) lineCountElement.textContent = "Lines used: 0";

      // Clear function lists
      const totalFunctionList = document.getElementById("totalFunctionList");
      if (totalFunctionList) totalFunctionList.innerHTML = "";

      // Reset timer display
      document.getElementById("timerDisplay").style.display = "none";
      document.getElementById("timerValue").textContent = "00:00:00";

      // Show start button again
      const startMazeTimerButton = document.getElementById("startMazeTimer");
      if (startMazeTimerButton) {
        startMazeTimerButton.style.display = "block";
      }

      // Hide send button and name input after successful sending
      if (isAfterSuccessfulSend) {
        document.getElementById("sendButton").style.display = "none";
        document.getElementById("nameInputContainer").style.display = "none";
      }

      // Find any Blockly Maze tabs and send message to clear data
      chrome.tabs.query({ url: "*://blockly.games/maze*" }, (tabs) => {
        if (tabs.length > 0) {
          // Send message to the content script in the Blockly Maze tab
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "clearAllData" },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message:",
                  chrome.runtime.lastError
                );
                // If there's an error, create a new tab
                chrome.tabs.create({
                  url: mazeLevel1Url,
                });
              } else {
                console.log("Message sent successfully:", response);
              }
            }
          );
        } else {
          // If no Blockly Maze tab is found, create a new one
          chrome.tabs.create({
            url: mazeLevel1Url,
          });
        }
      });

      showNotification("Alle Daten wurden gelöscht!");
    }
  );
}

// Function to show a notification
function showNotification(message, duration = 5000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.top = "50vh";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    notification.style.width = "260px";
    notification.style.textAlign = "center";
    document.body.appendChild(notification);
  }

  // Set message and show notification
  notification.textContent = message;
  notification.style.display = "block";

  // Hide after duration
  setTimeout(() => {
    notification.style.display = "none";
  }, duration);
}

function updateView() {
  chrome.storage.local.get(
    ["lastMazeData", "totalFunctionCounts", "level2CompletionTime"],
    (data) => {
      const totalCounts = data.totalFunctionCounts || {};

      // Display total counts in table format
      const totalList = document.getElementById("totalFunctionList");
      if (totalList) {
        totalList.innerHTML = "";

        let grandTotal = 0;

        // Sort functions alphabetically for better readability
        const sortedFunctions = Object.entries(totalCounts).sort((a, b) =>
          a[0].localeCompare(b[0])
        );

        for (const [func, count] of sortedFunctions) {
          const tr = document.createElement("tr");

          const funcCell = document.createElement("td");
          funcCell.textContent = `${func}()`;
          tr.appendChild(funcCell);

          const countCell = document.createElement("td");
          countCell.className = "countCell";
          countCell.textContent = count;
          tr.appendChild(countCell);

          totalList.appendChild(tr);

          // Add to grand total
          grandTotal += count;
        }

        // Update the summary row with the grand total
        document.getElementById("totalFunctionCount").textContent = grandTotal;

        // Show send button and name input if max level is reached
        const sendButton = document.getElementById("sendButton");
        const nameInputContainer =
          document.getElementById("nameInputContainer");

        // Check if level2CompletionTime exists, which indicates max level was completed
        if (data.level2CompletionTime) {
          sendButton.style.display = "block";
          nameInputContainer.style.display = "block";
        } else {
          sendButton.style.display = "none";
          nameInputContainer.style.display = "none";
        }
      }
    }
  );
}

// Call once at start
updateView();

// Update every 2 seconds
setInterval(updateView, 2000);

// Add this to check timer status periodically
setInterval(() => {
  chrome.storage.local.get(["timerRunning"], (data) => {
    if (data.timerRunning === false && timerRunning === true) {
      // Timer was stopped externally (e.g., level 2 completed)
      stopTimer();

      // Show completion message
      chrome.storage.local.get(["levelCompletionTimeFormatted"], (timeData) => {
        if (timeData.levelCompletionTimeFormatted) {
          showNotification(`Glückwunsch - Level ${maxLevel} abgeschlossen!`);
        }
      });
    }
  });
}, 1000);

// #region TIMER ##

const SERVER_URL = "http://192.168.8.76:3000/api/data";

function sendDataToServer(data) {
  fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Data sent successfully:", result);
      showNotification("Daten erfolgreich gesendet!", 3000);

      // Clear the input field
      document.getElementById("userName").value = "";

      // Clear data after successful sending
      clearAllData();
    })
    .catch((error) => {
      console.error("Error sending data:", error);
      showNotification("Fehler beim Senden der Daten", 3000);
    });
}

document.getElementById("sendButton").addEventListener("click", () => {
  // Get user name from input
  const userName = document.getElementById("userName").value.trim();

  // Validate name
  if (!userName) {
    showNotification("Bitte gib deinen Namen ein", 3000);
    return;
  }

  // Get real data from chrome.storage
  chrome.storage.local.get(
    [
      "lastMazeData",
      "totalFunctionCounts",
      "timerStartTime",
      "levelCompletionTimeFormatted",
    ],
    (data) => {
      // Calculate completion time
      let completionTime = 0;
      if (data.timerStartTime) {
        completionTime = Date.now() - data.timerStartTime;
      }

      // Extract current level from lastMazeData
      const currentLevel = data.lastMazeData?.level || "unknown";

      // Get total function counts
      const functionCounts = data.totalFunctionCounts || {};

      // Calculate total functions used
      const totalFunctions = Object.values(functionCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      // Get formatted time if available
      const formattedTime = data.levelCompletionTimeFormatted || "00:00:00";

      // Create comprehensive data object
      const dataToSend = {
        level: currentLevel,
        functionDetails: functionCounts,
        totalFunctions: totalFunctions,
        completionTimeMs: completionTime,
        completionTimeFormatted: formattedTime,
        name: userName,
        timestamp: new Date().toLocaleString("de-DE", {
          timeZone: "Europe/Berlin",
        }),
      };

      // Send data to server
      sendDataToServer(dataToSend);
    }
  );
});

// ##endregion
