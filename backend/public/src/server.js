import http from "http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { attachInterviewSocket } from "./socket/interview.socket.js";
const app = createApp();
const server = http.createServer(app);
attachInterviewSocket(server);
await connectDatabase();
server.listen(env.PORT, () => {
    console.info(`AI Interview Coach API listening on http://localhost:${env.PORT}`);
});
