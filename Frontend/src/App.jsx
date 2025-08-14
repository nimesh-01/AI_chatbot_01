import React, { useState, useEffect, useRef } from "react";
import { Send, Moon, Sun } from "lucide-react";
import { io } from "socket.io-client";

// Connect to backend Socket.IO server
const socket = io(import.meta.env.BACKEND_URL); // change to your backend URL if needed

const App = () => {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Apply theme to HTML tag & save to localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for AI responses from backend
  useEffect(() => {
    socket.on("ai-msg", (data) => {
      typeMessage(data.data); // Typing effect
    });

    return () => {
      socket.off("ai-msg");
    };
  }, []);

  // Function to simulate typing effect
  const typeMessage = (fullText) => {
    let index = -1;
    const interval = setInterval(() => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "ai" && lastMsg?.typing) {
          return [
            ...prev.slice(0, -1),
            { role: "ai", content: lastMsg.content + fullText[index], typing: true },
          ];
        } else {
          return [...prev, { role: "ai", content: fullText[index], typing: true }];
        }
      });

      index++;
      if (index === fullText.length - 1) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { role: "ai", content: m.content } : m
          )
        );
      }
    }, 5); // Adjust speed here
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    socket.emit("message", { msg: input });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between bg-blue-600 dark:bg-gray-800 text-white p-4 text-lg font-semibold shadow transition-colors duration-300">
        AI Chatbot
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow transition-colors duration-300 ${msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                }`}
            >
              {msg.content}
              {msg.typing && <span className="animate-pulse">▋</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 flex items-center gap-2 transition-colors duration-300 ">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type your message..."
          className="flex-1  scrollbar-hide overflow-y-auto resize-none p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-300"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center transition-colors duration-300"
        >
          <Send className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};

export default App;
