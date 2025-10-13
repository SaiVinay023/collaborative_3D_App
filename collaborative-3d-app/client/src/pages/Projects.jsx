import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import STLViewer from "../components/STLViewer";
import { useProject } from "../hooks/useProject";

export default function Projects() {
  const [annotations, setAnnotations] = useState([]);
  const {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    uploadModel
  } = useProject();

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!currentProject) return alert("Select a project first");
    try {
      await uploadModel(currentProject._id, file);
    } catch (error) {
      alert("Upload failed!");
    }
  };

  // Annotation handler (can broadcast or persist in future)
  const handleAddAnnotation = (anno) => {
    setAnnotations((prev) => [...prev, { ...anno, user: "Designer" }]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex h-screen pt-16">
        <Sidebar
          projects={projects}
          selectedProject={currentProject}
          onSelectProject={(project) => {
            setCurrentProject(project);
            setAnnotations(project.annotations || []);
          }}
          onCreateProject={createProject}
          onFileUpload={handleFileUpload}
          annotations={annotations}
        />
        {/* Main 3D Viewer Area */}
          <main className="flex-1 flex justify-center items-center bg-gray-900">
          <div className="bg-[#161b22] rounded-xl shadow-lg p-2 m-2 border border-gray-700 flex items-center justify-center"
            style={{ width: "calc(100vw - 350px)", height: "80vh", maxWidth: "1500px" }}>
          {currentProject?.modelUrl ? (
            <Canvas
              camera={{ position: [5, 5, 5], fov: 75 }}
              style={{ background: 'transparent' }}
              className="w-full h-full"
            >
              <STLViewer
                modelUrl={currentProject.modelUrl}
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
                  {currentProject
                    ? "Upload an STL file from the sidebar to start"
                    : "Select a project from the sidebar to begin"
                  }
                </p>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
