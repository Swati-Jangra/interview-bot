import { WebSocketServer, WebSocket } from "ws";
import { Interview } from "../models/Interview.js";
import { evaluateAnswer } from "../services/ai.service.js";
import { verifyAccessToken } from "../utils/tokens.js";
export function attachInterviewSocket(server) {
    const wss = new WebSocketServer({ server, path: "/ws/interview" });
    wss.on("connection", (socket, request) => {
        const auth = authenticateSocket(request);
        if (!auth) {
            socket.close(1008, "Unauthorized");
            return;
        }
        socket.on("message", async (payload) => {
            try {
                const message = JSON.parse(payload.toString());
                await handleMessage(socket, auth.sub, message);
            }
            catch (error) {
                send(socket, { type: "error", message: "Unable to process socket message" });
            }
        });
    });
}
async function handleMessage(socket, userId, message) {
    if (message.type === "ping")
        return send(socket, { type: "pong" });
    if (message.type === "interrupt")
        return send(socket, { type: "ai_interrupted" });
    if (message.type === "join") {
        const interview = await Interview.findOne({ _id: message.interviewId, userId });
        const firstQuestion = interview?.questions?.[0];
        return send(socket, {
            type: "session_ready",
            question: firstQuestion,
            aiText: firstQuestion?.prompt ?? "Let's begin. Tell me about yourself."
        });
    }
    if (message.type === "transcript") {
        send(socket, { type: "transcript_received", text: message.text });
        const interview = await Interview.findOne({ "questions._id": message.questionId, userId });
        const question = interview?.questions.id(message.questionId);
        const feedback = await evaluateAnswer(question?.prompt ?? "", message.text);
        const currentIndex = interview.questions.findIndex((item) => item._id.toString() === message.questionId);
        const nextQuestion = interview.questions[currentIndex + 1];
        send(socket, { type: "feedback", feedback });
        send(socket, { type: "ai_response", question: nextQuestion, aiText: nextQuestion?.prompt ?? "That completes the interview." });
    }
}
function authenticateSocket(request) {
    const url = new URL(request.url ?? "", "http://localhost");
    const token = url.searchParams.get("token");
    if (!token)
        return null;
    try {
        return verifyAccessToken(token);
    }
    catch {
        return null;
    }
}
function send(socket, payload) {
    if (socket.readyState === WebSocket.OPEN)
        socket.send(JSON.stringify(payload));
}
