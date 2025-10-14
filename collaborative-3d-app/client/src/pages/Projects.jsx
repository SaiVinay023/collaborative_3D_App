import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import STLViewer from "../components/STLViewer";
import Chat from "../components/Chat";
import { useProject } from "../hooks/useProject";

export default function Projects() {
  const [annotations, setAnnotations] = useState([]);
  const {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    uploadModel,
  } = useProject();

  const handleFileUpload = async (file) => {
    if (!currentProject) return alert("Select a project first");
    try {
      await uploadModel(currentProject._id, file);
    } catch (error) {
      alert("Upload failed!");
    }
  };

  const handleAddAnnotation = (anno) => {
    setAnnotations((prev) => [...prev, { ...anno, user: "Designer" }]);
  };

  return (
    <div className="min-h-screen bg-[#191c1e] text-white">
      <Header />
      <div className="flex h-screen pt-16">
        {/* LEFT PANEL - Sidebar */}
        <aside className="w-[320px] max-w-[340px] min-w-[250px] bg-[#1b2025] border-r border-gray-800 flex-shrink-0 flex flex-col">
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
        </aside>

        {/* CENTER PANEL - BIG 3D Viewer */}
        <main className="flex-1 flex justify-center items-center bg-[#191c1e]">
          <div
            className="bg-[#21262d] rounded-xl shadow-xl border border-gray-800 flex items-center justify-center"
            style={{
              width: "clamp(650px,65vw,1050px)",
              aspectRatio: "16/10",
              minHeight: "500px",
              minWidth: "330px",
              maxWidth: "1200px",
            }}
          >
            {currentProject?.modelUrl ? (
              <Canvas
                camera={{ position: [5, 5, 5], fov: 75 }}
                style={{ background: "#181b1f", borderRadius: "0.75rem" }}
                className="w-full h-full"
              >
                <STLViewer
                  modelUrl={currentProject.modelUrl}
                  annotations={annotations}
                  onAddAnnotation={handleAddAnnotation}
                />
              </Canvas>
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center w-full">
                <div className="text-6xl mb-4">🎲</div>
                <h2 className="text-xl font-semibold mb-2">No 3D Model Loaded</h2>
                <p className="text-gray-500 mb-4 max-w-md">
                  {currentProject
                    ? "Upload an STL file from the sidebar to view & edit"
                    : "Select a project from the sidebar to begin"}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL - Chat/Settings/Users */}
        <aside className="w-[340px] max-w-[390px] min-w-[240px] bg-[#1b2025] border-l border-gray-800 flex flex-col">
          <div className="px-6 pt-8 pb-2">
            <h3 className="font-bold text-xl mb-2 text-white">Users Online</h3>
            {/* TODO: Replace with live user list */}
            <div className="flex space-x-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
              <span className="text-gray-400 text-sm">You</span>
            </div>
            <h3 className="font-bold text-xl mb-2 text-white">Project Chat</h3>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden px-6 pb-4">
            <Chat
              projectId={currentProject?._id}
              // Pass your socket instance if needed as prop
              // socket={socket}
            />
          </div>
          <div className="border-t border-gray-700 px-6 py-4">
            <h4 className="text-md font-semibold text-white mb-2">Project Settings</h4>
            <div className="text-gray-400 text-sm">
              Autosave: <span className="text-green-400">On</span>
              <br />
              Max Objects: 100
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
