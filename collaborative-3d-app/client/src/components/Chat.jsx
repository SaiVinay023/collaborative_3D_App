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
    <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 flex flex-col h-64 text-white">
      <div className="flex-1 overflow-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <span className="font-semibold text-cyan-400">{m.user}:</span>{" "}
            <span className="text-sm text-white">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-600 rounded px-2 py-1 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="Send message..."
          onKeyDown={(e)=> e.key==='Enter' && send()}
        />
        <button
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded transition"
          onClick={send}
        >Send</button>
      </div>
    </div>
  );
}
