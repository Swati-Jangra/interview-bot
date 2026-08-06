const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callAIModel(
  messages: AIMessage[],
  model: string = "gpt-3.5-turbo",
  temperature: number = 0.7
): Promise<AIResponse> {
  if (!AI_API_KEY) {
    throw new Error("AI API key is not configured. Please set NEXT_PUBLIC_AI_API_KEY in your environment variables.");
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`AI API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || "",
      usage: data.usage,
    };
  } catch (error) {
    console.error("AI API call failed:", error);
    throw error;
  }
}

export async function generateAIResponse(
  systemPrompt: string,
  userQuery: string,
  context?: string
): Promise<string> {
  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: context ? `${context}\n\n${userQuery}` : userQuery },
  ];

  try {
    const response = await callAIModel(messages);
    return response.content;
  } catch (error) {
    console.error("Failed to generate AI response:", error);
    throw error;
  }
}
