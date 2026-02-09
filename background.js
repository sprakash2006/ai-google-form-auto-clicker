chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchCohereBatch") {
        fetchCohereBatch(request.apiKey, request.prompt, request.questionCount)
            .then(answers => sendResponse({ answers }))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep the message channel open for async response
    }
});

async function fetchCohereBatch(apiKey, prompt, questionCount) {
    const url = "https://api.cohere.com/v2/chat";

    const data = {
        model: "command-a-03-2025",
        messages: [
            { "role": "system", "content": "You are a helpful assistant. You answer multiple choice questions by returning ONLY the index of the correct option for each question. Return one index per line, in order. No explanations, no labels." },
            { "role": "user", "content": prompt }
        ],
        temperature: 0
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cohere API Error: ${response.status} - ${errorText}`);
        }

        const json = await response.json();
        const text = json.message?.content?.[0]?.text?.trim();
        console.log("Cohere raw response:", text);

        // Parse one index per line
        const lines = text.split(/\n/).map(line => line.trim()).filter(line => line !== "");
        const answers = [];

        for (let i = 0; i < questionCount; i++) {
            if (i < lines.length) {
                // Extract the first number found in the line
                const match = lines[i].match(/\d+/);
                const idx = match ? parseInt(match[0]) : -1;
                answers.push(!isNaN(idx) && idx >= 0 ? idx : -1);
            } else {
                answers.push(-1);
            }
        }

        console.log("Parsed answers:", answers);
        return answers;
    } catch (error) {
        console.error("Background fetch error:", error);
        throw error;
    }
}
