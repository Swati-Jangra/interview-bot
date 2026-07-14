export function interviewSystemPrompt(mode) {
    return `You are AI Interview Coach, a precise ${mode} interviewer. Ask one question at a time, adapt follow-ups to the candidate, and keep tone professional. Evaluate answers using communication, correctness, clarity, confidence, completeness, grammar, and filler-word signals.`;
}
export function questionGenerationPrompt(config) {
    return `Generate 8 interview questions as JSON with prompt, topic, difficulty, expectedSignals, followUps. Configuration: ${JSON.stringify(config)}.`;
}
export function evaluationPrompt(question, answer) {
    return `Evaluate this interview answer as strict JSON. Question: ${question}. Answer: ${answer}. Include communicationScore, technicalScore, confidenceScore, clarityScore, completenessScore, grammarScore, strengths, weaknesses, suggestions, modelAnswer.`;
}
