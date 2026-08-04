import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat.js";

export default function FloatingChatBubble() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const {
    messages,
    inputValue,
    setInputValue,
    loading,
    error,
    messagesEndRef,
    handleSendMessage,
    clearChat,
  } = useChat();

  const isOnChatPage = location.pathname === "/chat";

  if (isOnChatPage) {
    return null;
  }

  const handleGoToFullChat = () => {
    navigate("/chat");
  };

  return createPortal(
    <>
      <button
        className="floating-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowNotification(true)}
        onMouseLeave={() => setShowNotification(false)}
        title="Chat with cosmic assistant"
      >
        <span className="bubble-icon">🤖</span>
        <div className={`ai-notification ${showNotification ? "visible" : ""}`}>
          AI Chatbot
        </div>
      </button>

      {isOpen && (
        <div className="floating-chat-window">
          <div className="chat-window-header">
            <h3>Cosmic Chat</h3>
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

          <div className="chat-window-messages" onWheel={(e) => e.stopPropagation()}>
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

            {error && (
              <div className="error-message">
                <span>{error}</span>
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
              {loading ? "..." : "\u2192"}
            </button>
          </form>
        </div>
      )}
    </>,
    document.body,
  );
}
