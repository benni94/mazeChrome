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

            chrome.storage.local.set({ lastMazeData: data });
            console.log("Maze data captured:", data);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
