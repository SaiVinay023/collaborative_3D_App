import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
//import FileUpload from "../components/FileUpload";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
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
    //navigate(`/project/${p._id}`);
    setSelectedProject(p);
    fetchProjects();
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="flex h-screen pt-16"> {/* pt-16 for header height */}
        <Sidebar 
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={(project) => {
            setSelectedProject(project);
            setAnnotations(project.annotations || []);
          }}
          onCreateProject={createProject}
          onFileUpload={handleFileUpload}
          annotations={annotations}
        />
        
        {/* Main 3D Viewer Area */}
        <main className="flex-1 relative bg-gray-900">
          {selectedProject?.modelUrl ? (
            <Canvas
              camera={{ position: [5, 5, 5], fov: 75 }}
              style={{ background: 'transparent' }}
              className="w-full h-full"
            >
              <STLViewer
                modelUrl={selectedProject.modelUrl}
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
              />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎲</div>
                <h2 className="text-xl font-semibold mb-2">No 3D Model Loaded</h2>
                <p className="text-gray-500 max-w-md">
                  {selectedProject 
                    ? "Upload an STL file from the sidebar to start"
                    : "Select a project from the sidebar to begin"
                  }
                </p>
              </div>
            </div>
          )}
          
        </main>
      </div>
    </div>
  );
}
