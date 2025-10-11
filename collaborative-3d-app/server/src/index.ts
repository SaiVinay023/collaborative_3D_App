import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import projectRoutes from "./routes/project.routes";
import Project from "./models/Project";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/projects", projectRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  socket.on("joinProject", async ({ projectId, user }) => {
    socket.join(projectId);
    socket.data.user = user;
    // send current project
    const project = await Project.findById(projectId);
    socket.emit("project:load", project);
    // broadcast presence
    const clients = await io.in(projectId).fetchSockets();
    io.to(projectId).emit("presence:update", clients.map(c => c.data.user));
  });

  socket.on("annotation:add", async ({ projectId, annotation }) => {
    const p = await Project.findById(projectId);
    if (!p) return;
    p.annotations.push(annotation);
    await p.save();
    io.to(projectId).emit("annotation:added", annotation);
  });

  socket.on("chat:message", async ({ projectId, message }) => {
    const p = await Project.findById(projectId);
    if (!p) return;
    p.chat.push(message);
    await p.save();
    io.to(projectId).emit("chat:message", message);
  });

  socket.on("camera:update", async ({ projectId, camera }) => {
    await Project.findByIdAndUpdate(projectId, { cameraState: camera, updatedAt: new Date() });
    socket.to(projectId).emit("camera:updated", camera);
  });
});

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URL || "").then(() => {
  server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}).catch(err => console.error("mongo connect err", err));
