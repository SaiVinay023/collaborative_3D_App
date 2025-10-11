import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Viewer from "./pages/Viewer";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/project/:id" element={<Viewer />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
