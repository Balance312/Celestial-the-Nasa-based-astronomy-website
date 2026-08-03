import { useState, useRef, useEffect, useCallback } from "react";
import { sendChatMessage } from "../utils/chatbotService.js";

const CHAT_STORAGE_KEY = "celestialBubbleChatMessages";
const CHAT_SYNC_EVENT = "celestial-chat-sync";

const DEFAULT_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "Hi! Ask me anything about space and astronomy.",
  },
];

function loadStoredMessages() {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored chat messages", e);
  }
  return null;
}

function persistMessages(messages) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent(CHAT_SYNC_EVENT, { detail: messages }));
  } catch (e) {
    console.error("Failed to persist chat messages", e);
  }
}

/**
 * Custom hook encapsulating shared chat logic for ChatBot and FloatingChatBubble.
 *
 * Syncs state across multiple hook instances via a custom event, preventing
 * stale state when both FloatingChatBubble (always mounted) and ChatBot
 * (mounted on /chat) share the same localStorage key.
 *
 * @param {Object} options
 * @param {boolean} [options.persistToStorage=true] - Whether to persist messages to localStorage
 * @returns {Object} Chat state and actions
 */
export function useChat({ persistToStorage = true } = {}) {
  const [messages, setMessages] = useState(() => {
    if (persistToStorage) {
      return loadStoredMessages() || [...DEFAULT_MESSAGES];
    }
    return [...DEFAULT_MESSAGES];
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Persist to localStorage and broadcast to other hook instances
  useEffect(() => {
    if (persistToStorage) {
      persistMessages(messages);
    }
  }, [messages, persistToStorage]);

  // Listen for sync events from other hook instances (same tab)
  useEffect(() => {
    if (!persistToStorage) return;

    const handleSync = (e) => {
      setMessages(e.detail);
    };
    window.addEventListener(CHAT_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(CHAT_SYNC_EVENT, handleSync);
  }, [persistToStorage]);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      setError("");
      const userMessage = inputValue;
      setInputValue("");

      const userMsgObj = {
        id: Date.now(),
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
          id: Date.now(),
          role: "assistant",
          content: aiResponse,
        };
        setMessages((prev) => [...prev, aiMsgObj]);
      } catch (err) {
        setError(err.message || "Failed to get response. Please try again.");
        console.error("Chat error:", err);
      } finally {
        setLoading(false);
      }
    },
    [inputValue, messages],
  );

  const clearChat = useCallback(() => {
    setMessages([...DEFAULT_MESSAGES]);
    if (persistToStorage) {
      persistMessages(DEFAULT_MESSAGES);
    }
    setError("");
  }, [persistToStorage]);

  return {
    messages,
    inputValue,
    setInputValue,
    loading,
    error,
    messagesEndRef,
    handleSendMessage,
    clearChat,
  };
}
