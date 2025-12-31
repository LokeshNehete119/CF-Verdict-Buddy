const input = document.getElementById("handleInput");
const status = document.getElementById("status");
const saveBtn = document.getElementById("saveBtn");

// Load saved handle on open
chrome.storage.sync.get("handle", data => {
    if (data.handle) input.value = data.handle;
});

saveBtn.onclick = async () => {
    const handle = input.value.trim();

    if (!handle) {
        showStatus("Handle cannot be empty", false);
        return;
    }

    try {
        const res = await fetch(
            `https://codeforces.com/api/user.info?handles=${handle}`
        );

        const data = await res.json();

        // API returns status "OK" only if user exists
        if (data.status !== "OK") {
            showStatus("Handle does not exist ❌", false);
            return;
        }

        // valid → save
        chrome.storage.sync.set({ handle }, () => {
            showStatus("Saved successfully ✓", true);
        });

    } catch (e) {
        showStatus("Network error. Try again.", false);
    }
};

function showStatus(msg, success) {
    status.textContent = msg;
    status.style.color = success ? "#4ade80" : "#f87171";
    status.style.opacity = 1;

    setTimeout(() => status.style.opacity = 0, 2000);
}
