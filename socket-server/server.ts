import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
  });

  socket.on("code-change", ({ sessionId, code }) => {
    socket.to(sessionId).emit("code-change", code);
  });

  socket.on("language-change", ({ sessionId, language }) => {
    socket.to(sessionId).emit("language-change", language);
  });

  socket.on("code-run-result", ({ sessionId, output }) => {
    socket.to(sessionId).emit("code-run-result", output);
  });

  socket.on("participant-exited-fullscreen", ({ sessionId }) => {
    socket.to(sessionId).emit("participant-exited-fullscreen");
  });

  socket.on("participant-rejected-fullscreen", ({ sessionId }) => {
    socket.to(sessionId).emit("participant-rejected-fullscreen");
  });
});

httpServer.listen(3001, () => {
  console.log("Socket server running on port 5000");
});