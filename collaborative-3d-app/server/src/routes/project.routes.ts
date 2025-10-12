import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Project from "../models/Project";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.originalname.toLowerCase().endsWith('.stl')) {
      cb(null, true);
    } else {
      cb(new Error('Only STL files allowed!'));
    }
  }
});

// Existing routes...
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

// NEW: File upload endpoint
router.post("/upload", upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

const modelUrl = `http://localhost:4000/uploads/${file.filename}`;

// Update project with model URL
const project = await Project.findByIdAndUpdate(
  projectId,
  { 
    $push: { 
      models: { 
        name: file.originalname,
        url: modelUrl,
        transform: {}
      }
    },
     modelUrl: modelUrl
  },
  { new: true }
);


    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ 
      message: 'File uploaded successfully',
      modelUrl,
      project
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
