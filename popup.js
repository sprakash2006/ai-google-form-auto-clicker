const answersInput = document.getElementById("answers");
const saveAnswersButton = document.getElementById("saveAnswers");
const statusText = document.getElementById("status");

// Load saved answers
chrome.storage.local.get(["manualAnswers"], (result) => {
  if (result.manualAnswers) {
    answersInput.value = result.manualAnswers;
  }
});

// Save answers
saveAnswersButton.addEventListener("click", () => {
  const answers = answersInput.value.trim();
  if (answers) {
    chrome.storage.local.set({ manualAnswers: answers }, () => {
      statusText.textContent = "Answers saved!";
      setTimeout(() => statusText.textContent = "", 2000);
    });
  } else {
    statusText.textContent = "Please enter some answers.";
  }
});

document.getElementById("run").addEventListener("click", () => {
  const answers = answersInput.value.trim();
  if (!answers) {
    statusText.textContent = "Please enter answers first!";
    return;
  }

  // Save before running
  chrome.storage.local.set({ manualAnswers: answers }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
    });
  });
});

