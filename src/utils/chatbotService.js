/**
 * Send a message to the AI and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Array of previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export const sendChatMessage = async (userMessage, conversationHistory = []) => {
  try {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      if (response.status === 402) {
        throw new Error(
          errorBody?.error ||
          "OpenRouter rejected the request because the account has no credits. Add credits or use a funded OpenRouter account."
        );
      }

      throw new Error(errorBody?.error || errorBody?.message || "Chat service request failed");
    }

    const data = await response.json();
    const aiResponse = data.response || data.choices?.[0]?.message?.content || "No response received";

    return aiResponse;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
