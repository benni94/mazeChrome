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
    clearButton.addEventListener("click", () => {
      // Clear both lastMazeData and totalFunctionCounts
      chrome.storage.local.set(
        {
          lastMazeData: null,
          totalFunctionCounts: {},
        },
        () => {
          // Update the UI to reflect cleared data
          document.getElementById("mazeCode").textContent = "No data yet.";
          document.getElementById("level").textContent = "Level unknown";
          document.getElementById("lineCount").textContent = "Lines used: 0";

          // Clear function lists
          document.getElementById("totalFunctionList").innerHTML = "";

          // Show confirmation to user
          alert("All data has been cleared!");
        }
      );
    });
  }
});

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
