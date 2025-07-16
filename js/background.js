chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: chrome.runtime.getURL("sidepanel.html"),
        type: "popup",
        width: 400,
        height: 600,
        left: 0, // Or screen.availWidth - width for right side
        top: 0
    });
});
