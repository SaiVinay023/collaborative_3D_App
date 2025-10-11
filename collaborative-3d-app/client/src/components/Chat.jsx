import { useEffect, useState } from "react";

export default function Chat({ socket, projectId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!socket) return;
    socket.on("chat:message", (m) => setMessages((s) => [...s, m]));
    return () => socket.off("chat:message");
  }, [socket]);

  const send = () => {
    if (!text.trim()) return;
    const msg = { user: localStorage.getItem("username") || "anon", text: text.trim(), at: new Date() };
    socket.emit("chat:message", { projectId, message: msg });
    setMessages((s) => [...s, msg]);
    setText("");
  };

  return (
    <div className="w-72 bg-white border p-2 flex flex-col h-64">
      <div className="flex-1 overflow-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <strong>{m.user}:</strong> <span className="text-sm">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border p-1" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()} />
        <button className="bg-blue-600 text-white px-3 rounded" onClick={send}>Send</button>
      </div>
    </div>
  );
}
