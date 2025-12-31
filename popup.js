document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("handleInput");
    const saveBtn = document.getElementById("saveBtn");
    const status = document.getElementById("status");
    const toggle = document.getElementById("toggleNotifier");
    const label = document.querySelector(".toggle-text");

    // -------- load saved handle --------
    chrome.storage.sync.get(["handle", "enabled"], data => {
        if (data.handle) input.value = data.handle;

        toggle.checked = data.enabled ?? true;
        setLabelColor();
    });

    // -------- toggle color logic --------
    function setLabelColor() {
        if (!label) return;
        label.style.color = toggle.checked ? "#4ade80" : "#9ca3af";
    }

    toggle.onchange = () => {
        chrome.storage.sync.set({ enabled: toggle.checked });
        setLabelColor();
    };

    // -------- SAVE button logic --------
    saveBtn.onclick = async () => {

        const handle = input.value.trim();

        if (!handle) {
            showStatus("Handle cannot be empty", false);
            return;
        }

        // validate against Codeforces API
        try {
            const res = await fetch(
                `https://codeforces.com/api/user.info?handles=${handle}`
            );

            const json = await res.json();

            if (json.status !== "OK") {
                showStatus("Invalid handle ❌", false);
                return;
            }

            // save
            chrome.storage.sync.set({ handle }, () => {
                showStatus("Saved successfully ✓", true);
            });

        } catch (e) {
            showStatus("Network error", false);
        }
    };

    function showStatus(msg, ok) {
        status.textContent = msg;
        status.style.color = ok ? "#4ade80" : "#f87171";
        status.style.opacity = 1;
        setTimeout(() => status.style.opacity = 0, 1800);
    }

});
