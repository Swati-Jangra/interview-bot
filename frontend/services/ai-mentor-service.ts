import { generateAIResponse } from "./ai-service";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content:string;
  type?: "concept" | "resource" | "project" | "strategy" | "quiz";
  metadata?: any;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// AI-powered concept explanation
export async function explainConcept(query: string): Promise<Message> {
  const systemPrompt = `You are an expert programming mentor. Explain coding concepts clearly and concisely. 
- Provide a clear definition
- Include practical code examples
- Explain when and why to use the concept
- Keep explanations beginner-friendly but technically accurate
- Use markdown formatting for code blocks and emphasis`;

  try {
    const content = await generateAIResponse(systemPrompt, `Explain this programming concept: ${query}`);
    return {
      id: Date.now().toString(),
      role: "assistant",
      content,
      type: "concept"
    };
  } catch (error) {
    // Fallback to mock response if AI fails
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I encountered an error connecting to the AI service. Here's a general explanation:\n\n${query} is an important programming concept. Please ensure your AI API key is configured in the environment variables.`,
      type: "concept"
    };
  }
}

// Learning resources recommendation
export async function recommendResources(topic: string): Promise<Message> {
  const systemPrompt = `You are an expert programming mentor. Recommend high-quality learning resources for programming topics.
- Provide 3-5 curated resources per topic
- Include a mix of free and paid options
- Cover different learning styles (documentation, tutorials, courses, books)
- Include brief descriptions of each resource
- Provide direct links when possible
- Focus on modern, up-to-date resources`;

  try {
    const content = await generateAIResponse(systemPrompt, `Recommend learning resources for: ${topic}`);
    return {
      id: Date.now().toString(),
      role: "assistant",
      content,
      type: "resource"
    };
  } catch (error) {
    // Fallback to mock response if AI fails
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I encountered an error connecting to the AI service. Here are some general recommendations:\n\n**For Beginners:**\n- FreeCodeCamp (interactive coding)\n- Codecademy (structured courses)\n- MDN Web Docs (comprehensive documentation)\n\n**For Advanced Learning:**\n- LeetCode (algorithm practice)\n- GitHub Projects (real-world code)\n- Stack Overflow (problem-solving)\n\nPlease ensure your AI API key is configured in the environment variables.`,
      type: "resource"
    };
  }
}

// Project review
export async function reviewProject(projectCode: string): Promise<Message> {
  const systemPrompt = `You are an expert code reviewer. Analyze code and provide constructive feedback.
- Identify strengths in the code
- Point out issues and bugs
- Suggest improvements and best practices
- Comment on code organization and readability
- Provide specific, actionable feedback
- Use markdown formatting for structure
- Be encouraging but honest`;

  try {
    const content = await generateAIResponse(systemPrompt, `Review this code and provide feedback:\n\n\`\`\`\n${projectCode}\n\`\`\``);
    return {
      id: Date.now().toString(),
      role: "assistant",
      content,
      type: "project"
    };
  } catch (error) {
    // Fallback to mock response if AI fails
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I encountered an error connecting to the AI service. Here's a basic review:\n\n## Project Review\n\nPlease ensure your AI API key is configured in the environment variables for detailed AI-powered code review.`,
      type: "project"
    };
  }
}

// Interview strategy suggestions
export async function suggestStrategies(topic: string): Promise<Message> {
  const systemPrompt = `You are an expert interview coach. Provide actionable interview preparation strategies.
- Give specific, practical advice
- Cover both technical and behavioral aspects
- Include preparation tips and strategies
- Suggest practice methods
- Provide confidence-building techniques
- Tailor advice to the specific interview type if mentioned
- Use markdown formatting for structure`;

  try {
    const content = await generateAIResponse(systemPrompt, `Provide interview strategies for: ${topic}`);
    return {
      id: Date.now().toString(),
      role: "assistant",
      content,
      type: "strategy"
    };
  } catch (error) {
    // Fallback to mock response if AI fails
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I encountered an error connecting to the AI service. Here are general interview strategies:\n\n**Technical Interviews:**\n1. Practice coding problems daily\n2. Master data structures and algorithms\n3. Learn system design basics\n4. Practice explaining solutions\n\n**Behavioral Interviews:**\n1. Use the STAR method\n2. Prepare stories about your experiences\n3. Research the company\n4. Practice common questions\n\nPlease ensure your AI API key is configured in the environment variables for detailed AI-powered strategies.`,
      type: "strategy"
    };
  }
}

// Quiz generation
export async function generateQuiz(topic: string): Promise<QuizQuestion> {
  const systemPrompt = `You are an expert programming quiz generator. Create multiple-choice programming questions.
- Generate a clear, unambiguous question
- Provide 4 distinct options (A, B, C, D)
- Indicate the correct answer (0-3)
- Provide a clear explanation for why the answer is correct
- Make questions challenging but fair
- Focus on the specified topic if provided
- Return the response in JSON format with this structure:
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswer": number (0-3),
  "explanation": "string"
}`;

  try {
    const content = await generateAIResponse(systemPrompt, `Generate a programming quiz question about: ${topic}`);
    
    // Parse the AI response to extract quiz data
    // The AI should return JSON, but we need to handle potential parsing issues
    try {
      const quizData = JSON.parse(content);
      return {
        question: quizData.question || content,
        options: quizData.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: quizData.correctAnswer || 0,
        explanation: quizData.explanation || "Review the question and options to determine the correct answer."
      };
    } catch {
      // If JSON parsing fails, create a fallback quiz
      return {
        question: content.substring(0, 200) + "...",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "Please review the AI response above for the correct answer."
      };
    }
  } catch (error) {
    // Fallback to mock quiz if AI fails
    const quizzes: QuizQuestion[] = [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        correctAnswer: 2,
        explanation: "Binary search has O(log n) time complexity because it divides the search space in half with each iteration."
      },
      {
        question: "Which method is used to add an element to the end of an array in JavaScript?",
        options: ["unshift()", "push()", "pop()", "shift()"],
        correctAnswer: 1,
        explanation: "push() adds elements to the end of an array, while unshift() adds to the beginning."
      }
    ];
    return quizzes[Math.floor(Math.random() * quizzes.length)];
  }
}
