import React, { useState } from "react";
import FileUpload from "../FileUpload";
import Chat from "../Chat";
import Button from "../ui/Button";

const Sidebar = ({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onFileUpload,
  annotations,
}) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [newProjectTitle, setNewProjectTitle] = useState("");

  const tabs = [
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "tools", label: "Tools", icon: "🛠️" }
  ];

  const handleCreateProject = () => {
    if (newProjectTitle.trim()) {
      onCreateProject(newProjectTitle);
      setNewProjectTitle("");
    }
  };

  return (
    <aside className="w-80 bg-[#161b22] border-r border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
              activeTab === tab.id
                ? "bg-[#1f2937] text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="p-4 h-full flex flex-col">
            {/* Create Project */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                className="w-full px-3 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 mb-2"
              />
              <Button onClick={handleCreateProject} variant="primary" fullWidth>
                Create Project
              </Button>
            </div>

            {/* Project List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {projects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => onSelectProject(project)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedProject?._id === project._id
                      ? "bg-cyan-500/10 border-cyan-400"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="font-medium text-white">{project.title}</div>
                  <div className="text-xs text-gray-400 flex justify-between mt-1">
                    <span>{project.annotations?.length || 0} annotations</span>
                    {project.modelUrl && (
                      <span className="text-green-400">✓ Model</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="p-4 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                MODEL UPLOAD
              </h3>
              <FileUpload
                projectId={selectedProject?._id}
                onFileUpload={onFileUpload}
                enableDragDrop
                enableServerUpload={false}
              />
            </div>

            {selectedProject?.modelUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  MODEL INFO
                </h3>
                <div className="bg-gray-800/70 p-3 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">✓ Loaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annotations:</span>
                    <span className="text-gray-300">{annotations.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="h-full bg-[#0d1117]">
            <Chat socket={null} projectId={selectedProject?._id} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
