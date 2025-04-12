const API_URL = "https://jessai-backend.onrender.com"; // change to your backend domain or render/vercel URL

const businessInfo = `
Your name is JesAI.

You were created by Jess Studios.

Tone:
- Speak clearly and politely.
- Be concise but helpful.
- Avoid deep technical words.
- Use friendly, professional tone.
- Example: "Thanks for asking! Please let me know if I can help further."

Extra:
- Add bullet points if explaining steps or lists.
- Avoid giving false info.
`;

let messages = {
  history: [],
};

function formatText(text) {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

async function sendMessage() {
  const textarea = document.querySelector(".input-area textarea");
  const userMessage = textarea.value.trim();
  if (!userMessage) return;

  document.querySelector(".chat").insertAdjacentHTML("beforeend", `
    <div class="user"><p>${userMessage}</p></div>
  `);
  textarea.value = "";

  const loader = document.createElement("div");
  loader.classList.add("loader");
  document.querySelector(".chat").appendChild(loader);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: userMessage,
        history: messages.history,
        systemInstruction: businessInfo
      }),
    });

    const data = await res.json();
    loader.remove();

    if (data.reply) {
      document.querySelector(".chat").insertAdjacentHTML("beforeend", `
        <div class="model"><p>${formatText(data.reply)}</p></div>
      `);

      messages.history.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: data.reply }] }
      );
    }
  } catch (err) {
    loader.remove();
    document.querySelector(".chat").insertAdjacentHTML("beforeend", `
      <div class="error"><p>Error. Try again.</p></div>
    `);
  }
}

document.querySelector("button").addEventListener("click", sendMessage);
document.querySelector("textarea").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
