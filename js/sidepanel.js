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

        const list = document.getElementById("functionList");
        list.innerHTML = "";

        Object.entries(info.functionCounts).forEach(([fn, count]) => {
            const li = document.createElement("li");
            li.textContent = `${fn}(): ${count}`;
            list.appendChild(li);
        });
    });
});

function updateView() {
    chrome.storage.local.get("lastMazeData", (data) => {
        const info = data.lastMazeData;

        if (!info) {
            document.getElementById("mazeCode").textContent = "No data yet.";
            return;
        }

        document.getElementById("level").textContent = info.level
            ? `Level ${info.level}`
            : "Level unknown";

        document.getElementById("lineCount").textContent = `Lines used: ${info.lineCount || 0}`;
        document.getElementById("mazeCode").textContent = info.code || "";

        const list = document.getElementById("functionList");
        list.innerHTML = "";

        if (info.functionCounts) {
            for (const [func, count] of Object.entries(info.functionCounts)) {
                const li = document.createElement("li");
                li.textContent = `${func}(): ${count}`;
                list.appendChild(li);
            }
        }
    });
}


// Call once at start
updateView();

// Update every 2 seconds
setInterval(updateView, 2000);
