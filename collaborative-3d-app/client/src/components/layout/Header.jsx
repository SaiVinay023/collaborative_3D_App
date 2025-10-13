import React from 'react'

const Header = () => {
  const user = localStorage.getItem('username') || 'Anonymous'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-400">
          3D Collaborator
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-300">{user}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
