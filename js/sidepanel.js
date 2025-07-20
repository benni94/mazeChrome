document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("lastMazeData", (data) => {
        const info = data.lastMazeData;

        if (!info) {
            document.getElementById("mazeCode").textContent = "No data yet.";
            return;
        }

        document.getElementById("level").textContent = info.level
            ? `Level ${info.level}`
            : "Level unknown";

        document.getElementById("lineCount").textContent = `Lines used: ${info.lineCount}`;

        document.getElementById("mazeCode").textContent = info.code;

    });
    // Add event listener for the clear button
    const clearButton = document.getElementById("clearData");
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            // Clear both lastMazeData and totalFunctionCounts
            chrome.storage.local.set({
                lastMazeData: null,
                totalFunctionCounts: {}
            }, () => {
                // Update the UI to reflect cleared data
                document.getElementById("mazeCode").textContent = "No data yet.";
                document.getElementById("level").textContent = "Level unknown";
                document.getElementById("lineCount").textContent = "Lines used: 0";

                // Clear function lists
                document.getElementById("totalFunctionList").innerHTML = "";

                // Show confirmation to user
                alert("All data has been cleared!");
            });
        });
    }
});

function updateView() {
    chrome.storage.local.get(["lastMazeData", "totalFunctionCounts"], (data) => {
        const info = data.lastMazeData;
        const totalCounts = data.totalFunctionCounts || {};

        // [existing code to update current level info]

        // Display total counts
        const totalList = document.getElementById("totalFunctionList");
        if (totalList) {
            totalList.innerHTML = "";

            for (const [func, count] of Object.entries(totalCounts)) {
                const li = document.createElement("li");
                li.textContent = `${func}(): ${count}`;
                totalList.appendChild(li);
            }
        }
    });
}


// Call once at start
updateView();

// Update every 2 seconds
setInterval(updateView, 2000);
