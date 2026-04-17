import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../utils/chatbotService.js";
import "./ChatBot.css";

const BUBBLE_CHAT_STORAGE_KEY = "celestialBubbleChatMessages";

export default function ChatBot() {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(BUBBLE_CHAT_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored messages", e);
      }
    }
    return [
      {
        id: 1,
        role: "assistant",
        content: "Welcome to Cosmic Chat! 🌌 Ask me anything about space and astronomy.",
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    setError("");
    const userMessage = inputValue;
    setInputValue("");

    // Add user message to chat
    const userMsgObj = {
      id: messages.length + 1,
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsgObj]);

    setLoading(true);

    try {
      // Format conversation history for the API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await sendChatMessage(userMessage, conversationHistory);

      const aiMsgObj = {
        id: messages.length + 2,
        role: "assistant",
        content: aiResponse,
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      setError(
        err.message || "Failed to get response. Please try again.",
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Persist messages to localStorage
  useEffect(() => {
    localStorage.setItem(BUBBLE_CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearChat = () => {
    const initialMessages = [
      {
        id: 1,
        role: "assistant",
        content: "Welcome to Cosmic Chat! 🌌 Ask me anything about space and astronomy.",
      },
    ];
    setMessages(initialMessages);
    localStorage.setItem(BUBBLE_CHAT_STORAGE_KEY, JSON.stringify(initialMessages));
    setError("");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>🤖 Cosmic Chat</h1>
          <p>Chat with an AI about space and astronomy</p>
        </div>
        <button onClick={clearChat} className="clear-btn" title="Clear chat">
          Clear Chat
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message message-${msg.role}`}
          >
            <div className={`message-bubble ${msg.role}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message message-assistant">
            <div className="message-bubble assistant typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span>⚠ {error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chatbot-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about space..."
          disabled={loading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="send-btn"
        >
          {loading ? "..." : "→"}
        </button>
      </form>
    </div>
  );
}
