import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      alert("STL uploaded successfully!");
      fetchProjects();
    } else {
      alert("Upload failed!");
    }
  };

  // Add annotation locally & optionally send to backend
  const handleAddAnnotation = (anno) => {
    setAnnotations((prev) => [...prev, { ...anno, user: "DummyUser" }]);
    // TODO: emit via socket.io to other users
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Projects</h1>
        <div>
          <input
            className="border p-2 mr-2"
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={createProject}
          >
            Create
          </button>
        </div>
      </div>

      <ul className="mb-6">
        {projects.map((p) => (
          <li
            key={p._id}
            className={`border p-3 mb-2 rounded hover:shadow cursor-pointer ${
              selectedProject?._id === p._id ? "bg-gray-100" : ""
            }`}
            onClick={() => {
              setSelectedProject(p);
              setAnnotations(p.annotations || []);
            }}
          >
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">
              {new Date(p.updatedAt || p.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>

      {selectedProject && (
        <div className="p-4 border rounded flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <h2 className="text-xl mb-2">Upload STL for: {selectedProject.title}</h2>
            <FileUpload
              projectId={selectedProject._id}
              onFileUpload={handleFileUpload}
              enableDragDrop={true}
              enableServerUpload={false}
            />
          </div>

          <div className="md:w-2/3 h-[500px] border rounded">
            {selectedProject.modelUrl ? (
              <STLViewer
                modelUrl={selectedProject.modelUrl}
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Upload STL to preview
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
