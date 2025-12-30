const input = document.getElementById("handle");
const status = document.getElementById("status");
const saveBtn = document.getElementById("save");

chrome.storage.sync.get("handle", data => {
    if (data.handle) input.value = data.handle;
});

saveBtn.onclick = () => {
    chrome.storage.sync.set({ handle: input.value }, () => {
        status.textContent = "Saved!";
        setTimeout(() => status.textContent = "", 2000);
    });
};