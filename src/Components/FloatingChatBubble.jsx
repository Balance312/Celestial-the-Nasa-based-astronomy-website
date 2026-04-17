import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { sendChatMessage } from "../utils/chatbotService.js";
import "./FloatingChatBubble.css";

const BUBBLE_CHAT_STORAGE_KEY = "celestialBubbleChatMessages";

export default function FloatingChatBubble() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationTimeoutRef = useRef(null);
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
        content: "Hi! 👋 Ask me anything about space and astronomy.",
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if on chat page  
  const isOnChatPage = location.pathname === "/chat";

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Persist messages to localStorage
  useEffect(() => {
    if (!isOnChatPage) {
      localStorage.setItem(BUBBLE_CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isOnChatPage]);

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector(".chat-window-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    if (!isOnChatPage) {
      scrollToBottom();
    }
  }, [messages, isOnChatPage]);

  // Don't show bubble on chat page
  if (isOnChatPage) {
    return null;
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");

    const userMsgObj = {
      id: messages.length + 1,
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsgObj]);

    setLoading(true);

    try {
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
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToFullChat = () => {
    // Save messages to localStorage so full chat page can load them
    localStorage.setItem(BUBBLE_CHAT_STORAGE_KEY, JSON.stringify(messages));
    window.location.href = "/chat";
  };

  const clearChat = () => {
    const initialMessages = [
      {
        id: 1,
        role: "assistant",
        content: "Hi! 👋 Ask me anything about space and astronomy.",
      },
    ];
    setMessages(initialMessages);
    localStorage.setItem(BUBBLE_CHAT_STORAGE_KEY, JSON.stringify(initialMessages));
  };

  return createPortal(
    <>
      {/* Floating Bubble Button */}
      <button
        className="floating-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowNotification(true)}
        onMouseLeave={() => setShowNotification(false)}
        title="Chat with cosmic assistant"
      >
        <span className="bubble-icon">🤖</span>
        <div className={`ai-notification ${showNotification ? 'visible' : ''}`}>
          💬 AI Chatbot
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-window-header">
            <h3>🌌 Cosmic Chat</h3>
            <div className="header-actions">
              <button
                onClick={handleGoToFullChat}
                className="full-chat-btn"
                title="Open full chat page"
              >
                ⛶
              </button>
              <button
                onClick={clearChat}
                className="clear-btn-small"
                title="Clear chat"
              >
                ↺
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="close-btn"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-window-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.role}`}>
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

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-window-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about space..."
              disabled={loading}
              className="chat-input-small"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-btn-small"
            >
              {loading ? "..." : "→"}
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
}
