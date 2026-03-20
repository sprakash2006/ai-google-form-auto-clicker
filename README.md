# Mock Form Auto Clicker

A Chrome extension that allows you to automatically answer multiple-choice questions on Google Forms by providing a list of answer indices. It reads every MCQ on the page and clicks the specified options with human-like delays.

> **Disclaimer**: This tool is intended **only** for mock, practice, or self-created forms. It does **not** click the submit button. Do not use it on real exams or assessments.

---

## Features

- **Manual Answer Input** — directly specify the option numbers (e.g., `1, 2, 1, 3`) for the questions on the page.
- **Rewriting Answers** — if you rerun the extension with a different input, it will overwrite the previously selected options.
- **Auto-fill text fields** — pre-fills the first two text inputs (e.g. name and roll number).
- **Human-like delays** — adds a short pause between each click to mimic natural behavior.
- **Floating progress indicator** — shows real-time status on the page while the extension is working.
- **Local Persistence** — your answers are saved locally via `chrome.storage` for convenience.

## Tech Stack

| Layer | Technology |
|---|---|
| Platform | Chrome Extension (Manifest V3) |
| Language | JavaScript |
| Permissions | `activeTab`, `scripting`, `storage` |

## Project Structure

```
form-auto-clicker/
├── manifest.json   # Extension manifest (MV3)
├── popup.html      # Popup UI for answer index input & run button
├── popup.js        # Popup logic — saves choices, injects content script
├── content.js      # Content script — gathers questions, clicks answers
├── background.js   # Service worker — minimal background process
├── assets/
│   └── icon.png    # Extension icon (128×128)
└── README.md
```

## Getting Started

### Prerequisites

- Google Chrome (or any Chromium-based browser)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/form-auto-clicker.git
   ```
2. Open `chrome://extensions` in your browser.
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `form-auto-clicker` folder.

### Usage

1. Click the extension icon in the toolbar.
2. Enter your desired answers as a comma-separated list (e.g., `1, 2, 1, 3`).
   - `1` corresponds to the first option, `2` to the second, etc.
3. Navigate to a Google Form with multiple-choice questions.
4. Click **Run on Mock Form**.
5. Watch the floating indicator as questions are updated automatically.

## How It Works

1. **`popup.js`** saves the answers to `chrome.storage.local` and injects `content.js` into the active tab.
2. **`content.js`** scrapes all `[role="radiogroup"]` blocks on the page, extracts each question's text and option labels.
3. It parses your input string (e.g., `1, 2, 1`) and clicks the corresponding radio button for each question with a 200 ms delay between clicks.
4. Since Google Forms handle radio button selection by state, subsequent clicks on different options will "rewrite" the choice as expected.

## License

This project is provided as-is for educational purposes.
