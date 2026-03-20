console.log("Mock Form Auto Clicker loaded (Manual Mode)");

chrome.storage.local.get(["manualAnswers"], (result) => {
  const manualAnswers = result.manualAnswers;
  if (manualAnswers) {
    runManualAutomation(manualAnswers);
  } else {
    alert("Please enter answers in the extension popup first!");
    console.warn("No answers found in storage.");
  }
});

// ---- Gather all questions from the page ----
function gatherQuestions() {
  const questionBlocks = document.querySelectorAll('[role="radiogroup"]');
  const gathered = [];

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];

    let questionText = "Unknown Question";
    const heading = block.closest('[role="listitem"]')?.querySelector('[role="heading"]');
    if (heading) {
      questionText = heading.innerText;
    } else {
      const label = block.getAttribute('aria-label') || block.parentElement.innerText.split('\n')[0];
      if (label) questionText = label;
    }

    const options = block.querySelectorAll('[role="radio"]');
    const optionTexts = [];
    options.forEach(opt => {
      optionTexts.push(opt.getAttribute('aria-label') || opt.innerText || opt.nextElementSibling?.innerText || "Option");
    });

    gathered.push({ index: i, questionText, options, optionTexts, block });
  }
  return gathered;
}

// ---- Run manual automation based on input string ----
async function runManualAutomation(manualAnswersStr) {
  const questions = gatherQuestions();

  if (questions.length === 0) {
    alert("No MCQ questions found on this page.");
    return;
  }

  // Parse the input string: "1,2,1,3" -> [1, 2, 1, 3]
  const answerIndices = manualAnswersStr.split(",")
    .map(s => s.trim())
    .filter(s => s !== "")
    .map(s => parseInt(s));

  console.log(`Processing ${questions.length} question(s) with manual answers:`, answerIndices);

  // ---- Auto-fill text inputs (name / roll) ----
  const textInputs = document.querySelectorAll('input[type="text"]');
  if (textInputs.length >= 2) {
    textInputs[0].value = "Prakash Swami";
    textInputs[0].dispatchEvent(new Event("input", { bubbles: true }));

    textInputs[1].value = "CS123";
    textInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Show a floating progress indicator
  const progress = document.createElement("div");
  progress.id = "fac-progress";
  progress.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 999999;
    background: #333; color: #fff; padding: 12px 18px; border-radius: 8px;
    font-family: Arial, sans-serif; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  document.body.appendChild(progress);
  progress.textContent = `Applying manual answers...`;

  // Click the correct options
  let answered = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // User enters 1-based index, we need 0-based
    const userChoice = answerIndices[i];
    const internalIndex = userChoice - 1; 

    progress.textContent = `Clicking answers... (${i + 1}/${questions.length})`;

    if (!isNaN(internalIndex) && internalIndex >= 0 && q.options[internalIndex]) {
      q.options[internalIndex].click();
      console.log(`Q${q.index + 1}: Clicked option ${userChoice} (internal index ${internalIndex})`);
      answered++;
    } else {
      console.warn(`Q${q.index + 1}: No valid answer provided or option not found (User choice: ${userChoice})`);
    }

    // Small delay between clicks to look natural
    await new Promise(r => setTimeout(r, 200));
  }

  progress.textContent = `Done! ${answered} question(s) updated.`;
  setTimeout(() => progress.remove(), 4000);
  console.log("Automation complete");
}
