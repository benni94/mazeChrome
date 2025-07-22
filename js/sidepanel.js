// Function to check URL and hide div if needed
function checkUrlAndHideDiv() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (
      currentTab &&
      currentTab.url &&
      currentTab.url.startsWith("https://blockly.games")
    ) {
      // Hide the "Go to" div
      const goToDiv = document.querySelector("div.bottomWrapper > div");
      if (goToDiv) {
        goToDiv.style.display = "none";
      }
    } else {
      // Show the div if not on Blockly Games
      const goToDiv = document.querySelector("div.bottomWrapper > div");
      if (goToDiv) {
        goToDiv.style.display = "block";
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
});

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
  // Clear both lastMazeData and totalFunctionCounts
  chrome.storage.local.set(
    {
      lastMazeData: null,
      totalFunctionCounts: {},
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

      // Show notification that data was cleared
      showNotification("All data has been cleared!");
    }
  );
}

// Function to show a notification
function showNotification(message, duration = 3000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
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
  chrome.storage.local.get(["lastMazeData", "totalFunctionCounts"], (data) => {
    const info = data.lastMazeData;
    const totalCounts = data.totalFunctionCounts || {};

    // [existing code to update current level info]

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
    }
  });
}

// Call once at start
updateView();

// Update every 2 seconds
setInterval(updateView, 2000);
