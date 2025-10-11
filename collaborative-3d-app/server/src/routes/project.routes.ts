import { Router } from "express";
import Project from "../models/Project";

const router = Router();

router.get("/", async (req, res) => {
  const projects = await Project.find().sort({ updatedAt: -1 }).limit(100);
  res.json(projects);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  const p = await Project.create({ title, models: [], annotations: [], chat: [] });
  res.json(p);
});

router.get("/:id", async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

export default router;
