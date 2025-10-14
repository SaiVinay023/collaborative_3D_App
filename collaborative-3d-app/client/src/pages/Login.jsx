import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter your name");
    localStorage.setItem("username", username.trim());
    navigate("/projects");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">Enter your name</h2>
        <input
            className="w-full border p-2 rounded mb-3 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Alice or Bob"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Continue</button>
      </form>
    </div>
  );
}
