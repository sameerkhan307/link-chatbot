import { GoogleGenAI, Type } from "@google/genai";
import { Message, Sender } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to Gemini, providing the URL context and using Google Search
 * to ground the response in actual web data.
 */
export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  targetUrl: string
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  
  try {
    const model = 'gemini-2.5-flash';

    // Construct a system instruction that forces the model to focus on the provided URL.
    // We use the 'googleSearch' tool which allows Gemini to visit the URL if indexed/accessible
    // or search for information related to it.
    let systemInstruction = `You are a helpful AI assistant acting as a "Dialogflow" style agent for a specific website.
    
    The user has provided the following Target URL: ${targetUrl}
    
    Your goal is to answer questions strictly based on the content, context, and information available at that Target URL.
    If the user asks something unrelated to the URL, politely steer them back to the topic of the website.
    
    Be concise, professional, and helpful. Use the Search tool to verify information about the URL if needed.`;

    if (!targetUrl) {
      systemInstruction = "You are a helpful AI assistant. The user has not provided a URL yet, so ask them to provide one to start the specific context chat.";
    }

    // Convert internal message history to Gemini format
    // limiting history to last 10 turns to save tokens and keep context fresh
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.sender === Sender.User ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: currentMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable Google Search to ground the URL data
        temperature: 0.7,
      }
    });

    const text = response.text || "I couldn't generate a response. Please try again.";
    
    // Extract sources from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Remove duplicates from sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      text,
      sources: uniqueSources.length > 0 ? uniqueSources : undefined
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Sorry, I encountered an error while processing your request. Please ensure your API key is valid and try again."
    };
  }
};
