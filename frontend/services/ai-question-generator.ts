import type { User, InterviewMode } from "@/types";

interface QuestionContext {
  userProfile: User;
  interviewMode: InterviewMode;
  resumeData?: any;
  previousQuestions?: string[];
  difficulty?: "easy" | "medium" | "hard";
}

interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  expectedTopics: string[];
  followUpSuggestions: string[];
}

const questionTemplates = {
  technical: [
    {
      category: "Data Structures & Algorithms",
      questions: [
        "Can you explain the time complexity of your solution and why you chose this approach?",
        "How would you optimize this algorithm for better performance?",
        "Can you implement this solution using a different data structure?",
        "What edge cases did you consider, and how did you handle them?",
        "How would you scale this solution to handle millions of records?"
      ]
    },
    {
      category: "System Design",
      questions: [
        "How would you design a scalable system for a real-time chat application?",
        "Explain your approach to handling high availability and fault tolerance.",
        "How would you design the database schema for this application?",
        "What caching strategy would you use and why?",
        "How would you handle authentication and authorization in this system?"
      ]
    },
    {
      category: "Problem Solving",
      questions: [
        "Walk me through your thought process when approaching this problem.",
        "How do you break down complex problems into manageable parts?",
        "Can you describe a time when you had to debug a particularly difficult issue?",
        "How do you validate your solution before implementation?",
        "What resources do you use when you're stuck on a technical problem?"
      ]
    }
  ],
  behavioral: [
    {
      category: "Leadership & Teamwork",
      questions: [
        "Tell me about a time you had to lead a team through a challenging project.",
        "How do you handle conflicts within your team?",
        "Describe a situation where you had to motivate a struggling team member.",
        "How do you approach giving constructive feedback to colleagues?",
        "Can you share an example of how you've built consensus in a team?"
      ]
    },
    {
      category: "Adaptability & Learning",
      questions: [
        "Tell me about a time you had to learn a new technology quickly.",
        "How do you stay updated with the latest industry trends?",
        "Describe a situation where you had to adapt to significant changes at work.",
        "How do you approach learning from failures?",
        "Can you share an example of how you've improved a process?"
      ]
    },
    {
      category: "Communication",
      questions: [
        "How do you explain technical concepts to non-technical stakeholders?",
        "Describe a situation where effective communication was crucial to project success.",
        "How do you handle disagreements with product managers or other teams?",
        "Can you give an example of a presentation you're particularly proud of?",
        "How do you ensure your written communication is clear and effective?"
      ]
    }
  ],
  hr: [
    {
      category: "Career Goals",
      questions: [
        "Where do you see yourself in 5 years?",
        "Why are you interested in this role and our company?",
        "What motivates you in your career?",
        "How does this position align with your long-term goals?",
        "What are you looking for in your next opportunity?"
      ]
    },
    {
      category: "Cultural Fit",
      questions: [
        "What type of work environment do you thrive in?",
        "How do you handle work-life balance?",
        "What values are most important to you in a workplace?",
        "How do you contribute to a positive team culture?",
        "What do you know about our company culture?"
      ]
    },
    {
      category: "Experience & Background",
      questions: [
        "Walk me through your resume and highlight your key achievements.",
        "Why are you looking to leave your current position?",
        "What's your greatest professional achievement?",
        "How has your previous experience prepared you for this role?",
        "What unique perspective do you bring to this role?"
      ]
    }
  ],
  custom: [
    {
      category: "General",
      questions: [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and weaknesses?",
        "Why should we hire you?",
        "Do you have any questions for us?",
        "Is there anything else you'd like to share?"
      ]
    }
  ],
  company: [
    {
      category: "Company Specific",
      questions: [
        "What do you know about our company and products?",
        "Why do you want to work specifically for our company?",
        "How do you think you can contribute to our mission?",
        "What challenges do you think our industry is facing?",
        "How would you approach a project for our team?"
      ]
    }
  ]
};

export class AIQuestionGenerator {
  private context: QuestionContext;

  constructor(context: QuestionContext) {
    this.context = context;
  }

  generateQuestion(): GeneratedQuestion {
    const templates = questionTemplates[this.context.interviewMode] || questionTemplates.custom;
    const category = this.selectCategory(templates);
    const question = this.selectQuestion(category.questions, this.context.previousQuestions || []);
    
    return {
      question,
      category: category.category,
      difficulty: this.context.difficulty || "medium",
      expectedTopics: this.extractExpectedTopics(question, category.category),
      followUpSuggestions: this.generateFollowUps(question, category.category)
    };
  }

  generateFollowUpQuestions(previousAnswer: string): string[] {
    const followUps: string[] = [
      "Can you elaborate more on that point?",
      "How did you handle the challenges you mentioned?",
      "What was the impact of your actions?",
      "What would you do differently in hindsight?",
      "Can you provide a specific example?"
    ];
    
    // Return 2-3 random follow-ups
    return followUps.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  private selectCategory(templates: any[]): any {
    // Weighted random selection based on user profile
    const weights = templates.map((template, index) => {
      // In a real implementation, this would analyze user's resume and profile
      // to determine which categories to focus on
      return 1;
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < templates.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return templates[i];
      }
    }
    
    return templates[0];
  }

  private selectQuestion(questions: string[], previousQuestions: string[]): string {
    // Filter out already asked questions
    const availableQuestions = questions.filter(
      q => !previousQuestions.includes(q)
    );

    // If all questions have been asked, return a random one
    const pool = availableQuestions.length > 0 ? availableQuestions : questions;
    
    // Random selection
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private extractExpectedTopics(question: string, category: string): string[] {
    const topicMap: Record<string, string[]> = {
      "Data Structures & Algorithms": ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Searching"],
      "System Design": ["Scalability", "Databases", "Caching", "Load Balancing", "Microservices"],
      "Problem Solving": ["Debugging", "Optimization", "Algorithm Design", "Code Quality"],
      "Leadership & Teamwork": ["Team Management", "Conflict Resolution", "Mentoring", "Collaboration"],
      "Adaptability & Learning": ["Technology Learning", "Change Management", "Continuous Improvement"],
      "Communication": ["Technical Writing", "Presentations", "Stakeholder Management"],
      "Career Goals": ["Career Planning", "Professional Development", "Industry Knowledge"],
      "Cultural Fit": ["Team Culture", "Work Environment", "Company Values"],
      "Experience & Background": ["Project Experience", "Skills", "Achievements"],
      "General": ["Introduction", "Strengths", "Weaknesses", "Motivation"]
    };

    return topicMap[category] || ["General"];
  }

  private generateFollowUps(question: string, category: string): string[] {
    const followUpTemplates: Record<string, string[]> = {
      "Data Structures & Algorithms": [
        "Can you think of an alternative approach?",
        "What trade-offs did you consider?",
        "How would this perform with larger datasets?"
      ],
      "System Design": [
        "How would you handle failure scenarios?",
        "What monitoring would you implement?",
        "How would you scale this further?"
      ],
      "Leadership & Teamwork": [
        "How did you measure success?",
        "What would you do differently?",
        "How did the team respond?"
      ],
      "default": [
        "Can you provide more details?",
        "What was the outcome?",
        "What did you learn from this?"
      ]
    };

    return followUpTemplates[category] || followUpTemplates["default"];
  }

  generateInterviewPlan(totalQuestions: number): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const askedQuestions: string[] = [];

    for (let i = 0; i < totalQuestions; i++) {
      const question = this.generateQuestion();
      questions.push(question);
      askedQuestions.push(question.question);
      
      // Update context to avoid repeating questions
      this.context.previousQuestions = askedQuestions;
      
      // Vary difficulty
      if (i < totalQuestions / 3) {
        this.context.difficulty = "easy";
      } else if (i < (2 * totalQuestions) / 3) {
        this.context.difficulty = "medium";
      } else {
        this.context.difficulty = "hard";
      }
    }

    return questions;
  }
}

export function generateAIQuestion(
  userProfile: User,
  interviewMode: InterviewMode,
  previousQuestions: string[] = []
): GeneratedQuestion {
  const generator = new AIQuestionGenerator({
    userProfile,
    interviewMode,
    previousQuestions
  });

  return generator.generateQuestion();
}
