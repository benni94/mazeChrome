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
