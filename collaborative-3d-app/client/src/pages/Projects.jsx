import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import STLViewer from "../components/STLViewer";
import Chat from "../components/Chat";
import { useProject } from "../hooks/useProject";
import { useMemo } from "react";
import io from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";


export default function Projects() {
  const socket = useMemo(() => io(API), []);
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
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
  <Header />
  <div className="flex flex-1 overflow-hidden pt-14">
    {/* Sidebar */}
    <aside className="w-[300px] bg-[#161b22] border-r border-gray-800 overflow-y-auto">
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

    {/* Viewer */}
    <main className="flex-1 flex items-center justify-center bg-[#0d1117]">
      <div className="rounded-xl bg-[#161b22] border border-gray-800 p-2 shadow-lg"
           style={{ width: "70%", aspectRatio: "16/10", minWidth: "700px" }}>
        {currentProject?.modelUrl ? (
          <Canvas
            camera={{ position: [5, 5, 5], fov: 75 }}
            className="w-full h-full rounded-lg"
          >
            <STLViewer
              modelUrl={currentProject.modelUrl}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
            />
          </Canvas>
        ) : (
          <div className="text-center text-gray-400 py-10">
            <p>No 3D Model Loaded</p>
          </div>
        )}
      </div>
    </main>

    {/* Chat + Settings */}
    <aside className="w-[340px] bg-[#161b22] border-l border-gray-800 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Users Online</h3>
        <div className="flex items-center mt-2 space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-sm text-gray-400">You</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h3 className="text-lg font-semibol d mb-2">Project Chat</h3>
        <Chat socket={socket} projectId={currentProject?._id} />
      </div>
      <div className="border-t border-gray-700 px-6 py-4 text-sm text-gray-400">
        <h4 className="font-semibold text-white mb-2">Project Settings</h4>
        Autosave: <span className="text-green-400">On</span> <br />
        Max Objects: 100
      </div>
    </aside>
  </div>
</div>

  );
}
