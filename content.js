console.log("Mock Form Auto Clicker loaded (Cohere Version)");

chrome.storage.local.get(["cohereApiKey"], (result) => {
  const apiKey = result.cohereApiKey;
  if (apiKey) {
    runAutomation(apiKey);
  } else {
    alert("Please save your Cohere API Key in the extension popup first!");
    console.warn("No API Key found in storage.");
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

// ---- Run automation on all questions (single API call) ----
async function runAutomation(apiKey) {
  const questions = gatherQuestions();

  if (questions.length === 0) {
    alert("No MCQ questions found on this page.");
    return;
  }

  console.log(`Processing ${questions.length} question(s) in a single API call...`);

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
  progress.textContent = `Sending ${questions.length} question(s) to Cohere...`;

  // Build a single prompt with all questions
  const answers = await getAllAnswersFromCohere(apiKey, questions);

  if (!answers) {
    progress.textContent = "Error: Failed to get answers from Cohere.";
    setTimeout(() => progress.remove(), 4000);
    return;
  }

  // Click the correct options
  let answered = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answerIndex = answers[i];

    progress.textContent = `Clicking answers... (${i + 1}/${questions.length})`;

    if (answerIndex !== -1 && q.options[answerIndex]) {
      q.options[answerIndex].click();
      console.log(`Q${q.index + 1}: Clicked option index ${answerIndex}`);
      answered++;
    } else {
      console.warn(`Q${q.index + 1}: Could not determine answer (got index: ${answerIndex})`);
    }

    // Small delay between clicks to look natural
    await new Promise(r => setTimeout(r, 300));
  }

  progress.textContent = `Done! ${answered}/${questions.length} question(s) answered.`;
  setTimeout(() => progress.remove(), 4000);
  console.log("Automation complete");
}

// ---- Send all questions in one API call and parse all answers ----
async function getAllAnswersFromCohere(apiKey, questions) {
  const prompt = questions.map((q, i) => {
    const optList = q.optionTexts.map((opt, j) => `  ${j}: ${opt}`).join('\n');
    return `Q${i + 1}: ${q.questionText}\nOptions:\n${optList}`;
  }).join('\n\n');

  const fullPrompt = `
Answer the following ${questions.length} multiple choice questions.

${prompt}

Task: For each question, identify the correct option.
Output format: Return ONLY the answer indices, one per line, in order. Each line should contain ONLY a single number (0, 1, 2, etc.). No explanations, no labels, no extra text.
Example output for 3 questions:
2
0
1
`;

  console.log("Sending batch request to background script...");

  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: "fetchCohereBatch",
      apiKey: apiKey,
      prompt: fullPrompt,
      questionCount: questions.length
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
        resolve(null);
        return;
      }

      if (response && response.error) {
        console.error("API Error from background:", response.error);
        resolve(null);
      } else if (response && Array.isArray(response.answers)) {
        console.log("Background returned answers:", response.answers);
        resolve(response.answers);
      } else {
        console.warn("Invalid response from background:", response);
        resolve(null);
      }
    });
  });
}
