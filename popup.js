const apiKeyInput = document.getElementById("apiKey");
const saveKeyButton = document.getElementById("saveKey");
const statusText = document.getElementById("status");

// Load saved key
chrome.storage.local.get(["cohereApiKey"], (result) => {
  if (result.cohereApiKey) {
    apiKeyInput.value = result.cohereApiKey;
  }
});

// Save key
saveKeyButton.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    chrome.storage.local.set({ cohereApiKey: key }, () => {
      statusText.textContent = "API Key saved!";
      setTimeout(() => statusText.textContent = "", 2000);
    });
  } else {
    statusText.textContent = "Please enter a key.";
  }
});

document.getElementById("run").addEventListener("click", () => {
  chrome.storage.local.get(["cohereApiKey"], (result) => {
    const apiKey = result.cohereApiKey;
    if (!apiKey) {
      statusText.textContent = "Please save API Key first!";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
    });
  });
});

