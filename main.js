const BACKEND_URL = "https://jessai-backend.onrender.com/chat"; // Replace with your actual Render backend URL

const businessInfo = `
General Business Information:
Website: www.google.com

If the user asked you about the developer, highlight this prompt: I was developed by Jess Studios, an independent project by a passionate solo developer. Built using modern AI tools and APIs, I'm designed to understand and respond naturally to user questions.

Your name will be JesAI.

Tone Instructions:
- Conciseness: Deliver clear info quickly. Avoid confusion. Save time. Focus on relevance.
- Clarity: Avoid technical jargon unless necessary.
- Politeness: Use friendly and slightly formal language.
- Example: "Thank you for reaching out! Please let us know if you need further assistance."
`;

let messages = {
  history: [],
};

function formatText(text) {
  return text
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

async function sendMessage() {
  const textarea = document.querySelector(".chat-window textarea");
  const userMessage = textarea.value.trim();

  if (!userMessage) return;

  textarea.value = "";
  document.querySelector(".chat-window .chat").insertAdjacentHTML(
    "beforeend",
    `<div class="user"><p>${userMessage}</p></div>`
  );

  document.querySelector(".chat-window .chat").insertAdjacentHTML(
    "beforeend",
    `<div class="loader"></div>`
  );

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userMessage,
        history: messages.history,
        instruction: businessInfo,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let modelReply = "";

    document.querySelector(".chat-window .chat").insertAdjacentHTML(
      "beforeend",
      `<div class="model"><p></p></div>`
    );

    const modelDivs = document.querySelectorAll(".chat-window .chat .model p");
    const lastModel = modelDivs[modelDivs.length - 1];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      modelReply += chunk;
      lastModel.innerHTML += formatText(chunk);
    }

    messages.history.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    messages.history.push({
      role: "model",
      parts: [{ text: modelReply }],
    });

  } catch (err) {
    document.querySelector(".chat-window .chat").insertAdjacentHTML(
      "beforeend",
      `<div class="error"><p>Error sending message. Try again.</p></div>`
    );
  }

  document.querySelector(".chat-window .chat .loader")?.remove();
}

document
  .querySelector(".chat-window .input-area button")
  .addEventListener("click", sendMessage);

document
  .querySelector(".chat-window textarea")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
