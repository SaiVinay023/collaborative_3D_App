import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import projectRoutes from "./routes/project.routes";
import Project from "./models/Project";
import path from 'path';

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "https://cerulean-ganache-ef99e7.netlify.app"
];

const app = express();

function dynamicOrigin(origin, callback) {
  if (
    allowedOrigins.includes(origin) ||
    // Allow all branch/deploy preview URLs for your site
    (origin && origin.endsWith('.netlify.app') && origin.includes('cerulean-ganache-ef99e7'))
  ) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/projects", projectRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  socket.on("joinProject", async ({ projectId, user }) => {
    socket.join(projectId);
    socket.data.user = user;
    const project = await Project.findById(projectId);
    socket.emit("project:load", project);
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

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch((err) => console.error("mongo connect err", err));
