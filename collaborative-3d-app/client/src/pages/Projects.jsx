import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import STLViewer from "../components/STLViewer";
import Chat from "../components/Chat";
import { useProject } from "../hooks/useProject";
import { useSocket } from "../hooks/useSocket";
import { API } from "../utils/constants";

export default function Projects() {

  const socket = useSocket();
  const [annotations, setAnnotations] = useState([]);
    // State for object manipulation
  const [pos, setPos] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });
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

  function handleMoveObject(axis, value) {
    setPos((prev) => ({ ...prev, [axis]: value }));
  }
  function handleRotateObject(axis, value) {
    setRotation((prev) => ({ ...prev, [axis]: value }));
  }
  function handleScaleObject(axis, value) {
    setScale((prev) => ({ ...prev, [axis]: value }));
  }
  /*function saveScene() {
    alert(
      `Object state saved!\nPosition: ${JSON.stringify(
        pos
      )}\nRotation: ${JSON.stringify(rotation)}\nScale: ${JSON.stringify(scale)}`
    );
  } */
 function saveScene() {
  if (!currentProject) return;
  fetch(`${API}/projects/${currentProject._id}/transform`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position: pos,
      rotation: rotation,
      scale: scale
    })
  })
    .then(res => res.json())
    .then(data => { alert("Object state saved!"); })
    .catch(err => { alert("Save failed!"); });
}



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

   <main className="flex-1 flex flex-col items-center justify-center bg-[#0d1117]">
  {/* Viewer */}
  <div
    className="rounded-xl bg-[#161b22] border border-gray-800 p-2 shadow-lg"
    style={{
      width: "70%",
      minWidth: "700px",
      aspectRatio: "16/10",
      marginTop: "-38px", // Move viewer up by 1cm
      zIndex: 1,
      position: "relative"
    }}
  >
    {currentProject?.modelUrl ? (
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75 }}
        className="w-full h-full rounded-lg"
      >
        <STLViewer
          modelUrl={currentProject.modelUrl}
          annotations={annotations}
          onAddAnnotation={handleAddAnnotation}
          // Optionally pass pos/rotation/scale
        />
      </Canvas>
    ) : (
      <div className="text-center text-gray-400 py-10">
        <p>No 3D Model Loaded</p>
      </div>
    )}
  </div>

  {/* Object manipulation panel, matched width & right below viewer */}
<div
  className="bg-[#161b22] border border-gray-800 rounded-xl flex items-center justify-center gap-16 py-4"
  style={{
    width: "70%",
    minWidth: "700px",
    height: "180px"
  }}
>
  {/* Position */}
  <div className="flex flex-col items-center">
    <label className="block text-sm text-gray-400 mb-2">Position</label>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-cyan-400" style={{minWidth:"22px"}}>x</span>
        <input
          type="number"
          value={pos.x}
          onChange={e => handleMoveObject("x", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400" style={{minWidth:"22px"}}>y</span>
        <input
          type="number"
          value={pos.y}
          onChange={e => handleMoveObject("y", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-purple-400" style={{minWidth:"22px"}}>z</span>
        <input
          type="number"
          value={pos.z}
          onChange={e => handleMoveObject("z", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
    </div>
  </div>

  {/* Rotation */}
  <div className="flex flex-col items-center">
    <label className="block text-sm text-gray-400 mb-2">Rotation (deg)</label>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-cyan-400" style={{minWidth:"22px"}}>x</span>
        <input
          type="number"
          value={rotation.x}
          onChange={e => handleRotateObject("x", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400" style={{minWidth:"22px"}}>y</span>
        <input
          type="number"
          value={rotation.y}
          onChange={e => handleRotateObject("y", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-purple-400" style={{minWidth:"22px"}}>z</span>
        <input
          type="number"
          value={rotation.z}
          onChange={e => handleRotateObject("z", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
    </div>
  </div>

  {/* Scale */}
  <div className="flex flex-col items-center">
    <label className="block text-sm text-gray-400 mb-2">Scale</label>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-cyan-400" style={{minWidth:"22px"}}>x</span>
        <input
          type="number"
          step="0.01"
          value={scale.x}
          onChange={e => handleScaleObject("x", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400" style={{minWidth:"22px"}}>y</span>
        <input
          type="number"
          step="0.01"
          value={scale.y}
          onChange={e => handleScaleObject("y", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-purple-400" style={{minWidth:"22px"}}>z</span>
        <input
          type="number"
          step="0.01"
          value={scale.z}
          onChange={e => handleScaleObject("z", Number(e.target.value))}
          className="w-20 bg-gray-900 text-white px-2 py-1 rounded"
        />
      </div>
    </div>
  </div>

<button
    className="ml-8 px-6 py-2 bg-cyan-600 rounded text-white self-center"
    style={{minWidth: "90px", fontSize: "1.15rem"}}
    onClick={saveScene}
  >
        Save
  </button>
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
