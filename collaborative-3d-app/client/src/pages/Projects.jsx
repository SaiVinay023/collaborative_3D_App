import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Projects() {
  const [title, setTitle] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    const r = await fetch(`${API}/projects`);
    setProjects(await r.json());
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async () => {
    if (!title.trim()) return alert("Title is required");
    const r = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const p = await r.json();
    navigate(`/project/${p._id}`);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Projects</h1>
        <div>
          <input className="border p-2 mr-2" placeholder="Project title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={createProject}>Create</button>
        </div>
      </div>
      <ul>
        {projects.map(p => (
          <li key={p._id} className="border p-3 mb-2 rounded hover:shadow cursor-pointer" onClick={() => navigate(`/project/${p._id}`)}>
            <div className="font-medium">{p.title}</div>
            <div className="text-sm text-gray-500">{new Date(p.updatedAt || p.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
