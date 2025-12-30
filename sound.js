chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    try {
        if (msg.type === "play-ac") {
            await document.getElementById("ac").play();
        }

        if (msg.type === "play-fail") {
            await document.getElementById("fail").play();
        }

        sendResponse({ ok: true });   // 👈 respond to close the port
    } catch (e) {
        sendResponse({ ok: false, error: String(e) });
    }

    return true; // 👈 keep message channel open for async
});
