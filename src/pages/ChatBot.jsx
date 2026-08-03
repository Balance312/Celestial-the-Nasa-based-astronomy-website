import { useChat } from "../hooks/useChat.js";

export default function ChatBot() {
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

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>Cosmic Chat</h1>
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
            <span>{error}</span>
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
          {loading ? "..." : "\u2192"}
        </button>
      </form>
    </div>
  );
}
