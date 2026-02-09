# Mock Form Auto Clicker

A Chrome extension that uses the **Cohere AI API** to automatically answer multiple-choice questions on Google Forms. It reads every MCQ on the page, sends them to Cohere in a single batched request, and clicks the correct options — all with human-like delays.

> **Disclaimer**: This tool is intended **only** for mock, practice, or self-created forms. It does **not** click the submit button. Do not use it on real exams or assessments.

---

## Features

- **AI-powered answers** — leverages Cohere's `command-a-03-2025` model to determine the correct option for each question.
- **Batch processing** — all questions on the page are sent in one API call for speed and efficiency.
- **Auto-fill text fields** — pre-fills the first two text inputs (e.g. name and roll number).
- **Human-like delays** — adds a short pause between each click to mimic natural behavior.
- **Floating progress indicator** — shows real-time status on the page while the extension is working.
- **Secure key storage** — your Cohere API key is saved locally via `chrome.storage` and never leaves your browser except to call the API.

## Tech Stack

| Layer | Technology |
|---|---|
| Platform | Chrome Extension (Manifest V3) |
| Language | JavaScript |
| AI Backend | [Cohere](https://cohere.com) Chat API (v2) |
| Permissions | `activeTab`, `scripting`, `storage` |

## Project Structure

```
form-auto-clicker/
├── manifest.json   # Extension manifest (MV3)
├── popup.html      # Popup UI with API key input & run button
├── popup.js        # Popup logic — saves key, injects content script
├── content.js      # Content script — gathers questions, clicks answers
├── background.js   # Service worker — proxies Cohere API calls
├── assets/
│   └── icon.png    # Extension icon (128×128)
└── README.md
```

## Getting Started

### Prerequisites

- Google Chrome (or any Chromium-based browser)
- A free [Cohere API key](https://dashboard.cohere.com/api-keys)

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
2. Enter your Cohere API key and click **Save Key** (only needed once).
3. Navigate to a Google Form with multiple-choice questions.
4. Click **Run on Mock Form**.
5. Watch the floating indicator as questions are answered automatically.

## How It Works

1. **`popup.js`** saves the API key to `chrome.storage.local` and injects `content.js` into the active tab.
2. **`content.js`** scrapes all `[role="radiogroup"]` blocks on the page, extracts each question's text and option labels, then sends them to the background service worker.
3. **`background.js`** makes a single POST request to Cohere's chat endpoint with a carefully structured prompt that asks for one answer index per line.
4. The parsed indices are returned to `content.js`, which clicks the matching radio button for each question with a 300 ms delay between clicks.

## License

This project is provided as-is for educational purposes.
