function extractLevel(text) {
    const match = text.match(/level (\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}

const observer = new MutationObserver(() => {
    const dialog = document.getElementById("dialogDone");
    if (dialog && dialog.style.display !== "none") {
        const codeBlock = document.getElementById("containerCode")?.innerText;
        const levelText = document.getElementById("dialogDoneText")?.innerText;

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
                functionCounts
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

            console.log("Maze data captured:", data);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });