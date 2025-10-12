import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import FileUpload from "../components/FileUpload";
import STLViewer from "../components/STLViewer";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Projects() {
  const [title, setTitle] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const navigate = useNavigate();

  // Fetch all projects
  const fetchProjects = async () => {
    const r = await fetch(`${API}/projects`);
    setProjects(await r.json());
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Create new project
  const createProject = async () => {
    if (!title.trim()) return alert("Title is required");
    const r = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const p = await r.json();
    navigate(`/project/${p._id}`);
  };

  // Handle STL upload
  const handleFileUpload = async (file) => {
    if (!selectedProject) return alert("Select a project first");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", selectedProject._id);

    const res = await fetch(`${API}/projects/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      // Update selected project with new model URL
      setSelectedProject(prev => ({
        ...prev,
        modelUrl: result.modelUrl
      }));
      // Refresh projects list
      fetchProjects();
    } else {
      alert("Upload failed!");
    }
  };

  // Add annotation
  const handleAddAnnotation = (anno) => {
    setAnnotations((prev) => [...prev, { ...anno, user: "Designer" }]);
  };

  return (
    <div className="dark-theme">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              3D Collaboration Studio
            </h1>
            <div className="flex gap-3">
              <input
                className="bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
                onClick={createProject}
              >
                Create Project
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {projects.map((p) => (
              <div
                key={p._id}
                className={`modern-card cursor-pointer transition-all hover:border-cyan-400 ${
                  selectedProject?._id === p._id ? "border-cyan-400 bg-gray-800" : ""
                }`}
                onClick={() => {
                  setSelectedProject(p);
                  setAnnotations(p.annotations || []);
                }}
              >
                <div className="font-semibold text-lg mb-2">{p.title}</div>
                <div className="text-gray-400 text-sm mb-2">
                  {new Date(p.updatedAt || p.createdAt).toLocaleString()}
                </div>
                {/* Show upload status */}
                <div className="flex items-center gap-2">
                  {p.modelUrl ? (
                    <div className="text-green-400 text-sm flex items-center gap-1">
                      ✓ STL Uploaded
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No model uploaded
                    </div>
                  )}
                  {selectedProject?._id === p._id && (
                    <div className="text-cyan-400 text-sm">
                      ● Selected
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 3D Viewer Section */}
          {selectedProject && (
            <div className="modern-card">
              <div className="grid lg:grid-cols-4 gap-6">
                
                {/* Upload Section */}
                <div className="lg:col-span-1">
                  <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                    Upload STL Model
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    Project: {selectedProject.title}
                  </p>
                  {selectedProject.modelUrl && (
                    <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg">
                      <div className="text-green-400 text-sm font-medium">✓ Model Uploaded</div>
                      <div className="text-green-300 text-xs mt-1">
                        Click on the 3D model to add annotations
                      </div>
                    </div>
                  )}
                  <FileUpload
                    projectId={selectedProject._id}
                    onFileUpload={handleFileUpload}
                    enableDragDrop={true}
                    enableServerUpload={false}
                  />
                </div>

                {/* 3D Viewer */}
                <div className="lg:col-span-3">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    3D Model Viewer
                  </h2>
                  <div className="viewer-container h-[600px] relative">
                    {selectedProject.modelUrl ? (
                      <Canvas
                        camera={{ position: [5, 5, 5], fov: 75 }}
                        style={{ background: 'transparent' }}
                      >
                        <STLViewer
                          modelUrl={selectedProject.modelUrl}
                          annotations={annotations}
                          onAddAnnotation={handleAddAnnotation}
                        />
                      </Canvas>
                    ) : (
                      /* Upload Prompt - NO CUBE */
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-6xl mb-6 opacity-50">📂</div>
                        <div className="text-xl font-medium mb-2">No 3D Model Yet</div>
                        <div className="text-gray-500 text-center max-w-md">
                          Upload an STL file using the panel on the left to view and annotate your 3D model
                        </div>
                        <div className="mt-6 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm">
                          Supported: <span className="text-cyan-400">.stl files</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* No Project Selected State */}
          {!selectedProject && (
            <div className="modern-card text-center">
              <div className="text-6xl mb-6 opacity-30">🎯</div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-300">
                Select a Project to Get Started
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose a project from the list above or create a new one to upload STL files and start collaborating in 3D.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
