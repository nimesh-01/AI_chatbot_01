import React, { useState, useEffect, useRef } from "react";
import { Send, Moon, Sun, Copy } from "lucide-react";
import { io } from "socket.io-client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Connect to backend Socket.IO server
const socket = io("https://ai-chatbot-01-uq0k.onrender.com");

const App = () => {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("ai-msg", (data) => {
      typeMessage(data); // Typing effect
    });

    return () => {
      socket.off("ai-msg");
    };
  }, []);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  // Apply theme (updates data-theme attr)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing effect
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
    }, 5);
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

  // Function to parse AI response and render code blocks
  const renderAIMessage = (content) => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, lang, code] = match;
      const before = content.slice(lastIndex, match.index);
      if (before) parts.push(<p key={lastIndex}>{before}</p>);

      parts.push(
        <div key={match.index} className="relative my-2">
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="absolute right-2 top-2 text-xs px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            <Copy size={14} />
          </button>
          <SyntaxHighlighter
            language={lang || "javascript"}
            style={oneDark}
            customStyle={{
              borderRadius: "0.5rem",
              padding: "1rem",
              fontSize: "0.85rem",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = regex.lastIndex;
    }

    const after = content.slice(lastIndex);
    if (after) parts.push(<p key={lastIndex}>{after}</p>);

    return parts;
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between p-4 text-lg font-semibold shadow"
        style={{ backgroundColor: "var(--card-color)", color: "var(--text-color)" }}
      >
        AI Chatbot
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg"
          style={{
            backgroundColor: "var(--input-bg)",
            border: `1px solid var(--input-border)`,
          }}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 flex justify-center">
        <div className="w-full max-w-3xl space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="px-4 py-2 rounded-lg shadow whitespace-pre-wrap"
                style={{
                  backgroundColor:
                    msg.role === "user" ? "#3b82f6" : "var(--card-color)",
                  color: msg.role === "user" ? "#fff" : "var(--text-color)",
                  border:
                    msg.role === "ai"
                      ? `1px solid var(--input-border)`
                      : "none",
                  maxWidth: "75%",
                }}
              >
                {msg.role === "ai" ? (
                  <>
                    {renderAIMessage(msg.content)}
                    {msg.typing && <span className="animate-pulse">▋</span>}
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer
        className="p-4 flex justify-center border-t"
        style={{
          backgroundColor: "var(--card-color)",
          borderColor: "var(--input-border)",
        }}
      >
        <div className="w-full max-w-3xl flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg resize-none text-sm md:text-base"
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--text-color)",
              border: `1px solid var(--input-border)`,
            }}
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-lg text-white"
            style={{ backgroundColor: "#3b82f6" }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
