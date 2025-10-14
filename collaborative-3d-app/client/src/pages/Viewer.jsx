import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Chat from "../components/Chat";
import AnnotationMarker from "../components/AnnotationMarker";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Scene({ annotations, onDoubleClick }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      <mesh position={[0, 0, 0]} castShadow onDoubleClick={(e) => onDoubleClick(e.point)}>
        <boxGeometry args={[1.5, 1, 0.8]} />
        <meshStandardMaterial color="#7dd3fc" />
      </mesh>
      {annotations.map((a, i) => (
        <mesh key={i} position={a.position}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color="red" />
          <Html center distanceFactor={6}>
            <AnnotationMarker text={a.text} />
          </Html>
        </mesh>
      ))}
    </>
  );
}

export default function Viewer() {
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [project, setProject] = useState(null);
  const canvasRef = useRef();

  useEffect(() => {
    // fetch project initial state
    fetch(`${API}/projects/${id}`).then(r=>r.json()).then(p=> {
      setProject(p);
      setAnnotations(p.annotations || []);
    });

    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", { transports: ["websocket"] });
    s.emit("joinProject", { projectId: id, user: localStorage.getItem("username") || "anon" });

    s.on("project:load", (payload) => {
      if (payload) {
        setProject(payload);
        setAnnotations(payload.annotations || []);
      }
    });

    s.on("annotation:added", (a) => setAnnotations(prev => [...prev, a]));
    s.on("chat:message", () => {}); // chat handled in Chat component
    s.on("camera:updated", (c) => { /* optional: show presence */ });

    setSocket(s);
    return () => s.disconnect();
  }, [id]);

  const handleDoubleClick = (point) => {
    const a = { position: [point.x, point.y, point.z], text: `Note by ${localStorage.getItem("username") || "anon"}`, user: localStorage.getItem("username") || "anon", createdAt: new Date() };
    setAnnotations(prev => [...prev, a]);
    if (socket) socket.emit("annotation:add", { projectId: id, annotation: a });
    // optimistic local save; server saves too
  };

  return (
    <div className="w-full h-screen flex">
      <div className="flex-1 relative">
        <Canvas ref={canvasRef} camera={{ position: [3, 3, 3] }}>
          <Suspense fallback={null}>
            <Scene annotations={annotations} onDoubleClick={handleDoubleClick} />
            <OrbitControls makeDefault />
          </Suspense>
        </Canvas>
      </div>

      <div className="w-80 border-l p-2 bg-gray-50">
        <div className="mb-4">
          <h2 className="font-semibold text-lg">{project?.title || "Project"}</h2>
          <div className="text-xs text-gray-500">ID: {id}</div>
        </div>
        <Chat socket={socket} projectId={id} />
      </div>
    </div>
  );
}
