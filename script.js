const landing = document.getElementById("landing");
const app = document.getElementById("app");
const content = document.getElementById("content");
const input = document.getElementById("userInput");
const pageTitle = document.getElementById("pageTitle");

let savedQuestions = JSON.parse(localStorage.getItem("askArpitaSaved")) || [];

function startApp() {
  landing.style.display = "none";
  app.style.display = "flex";
  input.focus();
}

function setActiveMenu(clickedButton) {
  document.querySelectorAll(".menu").forEach(button => button.classList.remove("active"));
  if (clickedButton) clickedButton.classList.add("active");
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.innerText = text;
  content.appendChild(message);
  content.scrollTop = content.scrollHeight;
  return message;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  savedQuestions.push(text);
  localStorage.setItem("askArpitaSaved", JSON.stringify(savedQuestions));

  input.value = "";
  const loading = addMessage("Ask Arpita is thinking...", "bot");

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    loading.innerText = data.reply || "No response received.";
  } catch (error) {
    loading.innerText = "Backend is not connected. Please run: node server.js";
  }
}

function quickAsk(text) {
  input.value = text;
  sendMessage();
}

function newChat() {
  pageTitle.innerText = "Chat";
  content.innerHTML = `
    <div class="welcome">
      <h2>Hello, I am Ask Arpita</h2>
      <p>A fresh chat is ready. Ask me anything.</p>
    </div>
    <div class="message bot">New chat started.</div>
  `;
  input.focus();
}

function openSection(section, clickedButton) {
  setActiveMenu(clickedButton);
  pageTitle.innerText = section.charAt(0).toUpperCase() + section.slice(1);
  content.innerHTML = "";

  if (section === "chat") {
    newChat();
    return;
  }

  if (section === "saved") {
    addMessage("Saved questions", "bot");
    if (savedQuestions.length === 0) {
      addMessage("Nothing saved yet. Ask a question first.", "bot");
      return;
    }
    savedQuestions.slice().reverse().forEach(question => addMessage(question, "bot"));
    return;
  }

  if (section === "voice") {
    addMessage("Voice Chat", "bot");
    addMessage("Click the Voice button on top. It uses your browser speech recognition if available.", "bot");
    return;
  }

  if (section === "tools") {
    addMessage("AI Tools", "bot");
    addMessage("Coding Helper\nEmail Writer\nStudy Planner\nProject Idea Generator\nResume Bullet Improver", "bot");
    return;
  }

  if (section === "settings") {
    addMessage("Settings", "bot");
    addMessage("Theme: Dark Premium\nAssistant: Ask Arpita\nChat storage: Browser localStorage", "bot");
  }
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser. Try Chrome or Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.start();

  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    sendMessage();
  };

  recognition.onerror = () => {
    alert("Voice input failed. Please try again.");
  };
}

input.addEventListener("keydown", event => {
  if (event.key === "Enter") sendMessage();
});
