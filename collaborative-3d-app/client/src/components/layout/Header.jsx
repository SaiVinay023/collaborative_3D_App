import React from "react";
import { Share2, LogOut } from "lucide-react";

const Header = () => {
  const user = localStorage.getItem("username") || "Anonymous";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#161b22] border-b border-gray-800 px-6 h-14 flex items-center justify-between">
      {/* Brand Section */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold text-cyan-400 tracking-wide">
          3D Collaborator
        </h1>
        <span className="text-xs text-gray-500">
          • powered by <span className="text-cyan-500 font-medium">Perplexity Labs</span>
        </span>
      </div>

      {/* User & Controls */}
      <div className="flex items-center space-x-3">
        <button
          className="flex items-center space-x-1 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-lg hover:bg-cyan-500/20 transition"
          onClick={() => console.log("Share clicked")}
        >
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm">Share</span>
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-800/80 border border-gray-700">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-sm text-gray-300">{user}</span>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("username");
            window.location.reload();
          }}
          className="flex items-center text-sm text-red-400 hover:text-red-300 transition"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
