/**
 * OpenRouter API service for chatbot
 * Handles all communication with the OpenRouter AI API
 */

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!API_KEY) {
  console.warn("OpenRouter API key not found in environment variables");
}

/**
 * Send a message to the AI and get a response
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Array of previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export const sendChatMessage = async (userMessage, conversationHistory = []) => {
  try {
    if (!API_KEY) {
      throw new Error("API key not configured");
    }

    // Build conversation with proper format
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful and friendly cosmic assistant on 'Celestial', an astronomy website created by Balance Breaker and powered by NASA's APOD (Astronomy Picture of the Day) API. The website offers: 1) Daily APOD - Today's astronomy picture with professional explanations, 2) Gallery - Browse thousands of past NASA images and videos, 3) Earth EPIC - Explore Earth images from NASA's EPIC satellite, 4) My Space Collection - Users can favorite and save images they like. You help users learn about space, astronomy, cosmic phenomena, and guide them to relevant website features. Keep responses concise, engaging, and provide helpful tips about using the website. Mention relevant pages when appropriate (like 'Check out our Gallery page to explore more images' or 'Visit Today's APOD for the latest astronomical discoveries'). If asked about the creator or who built this website, mention that Celestial was created by Balance Breaker.",
      },
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No response received";

    return aiResponse;
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
