import React, { useState, useRef } from 'react'
import axios from 'axios'
import { API } from '../utils/constants'

export default function FileUpload({
  projectId,
  onFileUpload,        // Option 1 callback
  onUploadComplete,    // Option 3 callback
  enableDragDrop = true,
  enableServerUpload = false,
}) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef()

  // Handle file (Option 1)
  const handleFile = async (file) => {
    if (!file.name.endsWith('.stl')) {
      alert('Only STL files allowed!')
      return
    }

    if (enableServerUpload) {
      // Option 3: Upload to server with progress
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      setUploading(true)
      try {
        const res = await axios.post(`${API}/projects/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) =>
            setProgress(Math.round((event.loaded / event.total) * 100)),
        })
        onUploadComplete?.(res.data)
      } catch (err) {
        console.error(err)
        alert('Upload failed')
      } finally {
        setProgress(0)
        setUploading(false)
      }
    } else {
      // Option 1: Call parent callback
      setUploading(true)
      await onFileUpload?.(file)
      setUploading(false)
    }
  }

  // Drag & drop handlers (Option 2)
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-xl p-8 
        text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${dragActive 
          ? 'border-cyan-400 bg-cyan-400/10 scale-105 shadow-lg shadow-cyan-400/25' 
          : uploading
            ? 'border-yellow-400 bg-yellow-400/5'
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-800/50'
        }
        backdrop-blur-sm
      `}
      onClick={() => !uploading && inputRef.current.click()}
      {...(enableDragDrop && !uploading
        ? {
            onDragEnter: handleDrag,
            onDragOver: handleDrag,
            onDragLeave: handleDrag,
            onDrop: handleDrop,
          }
        : {})}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        className="hidden"
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        disabled={uploading}
      />

      {/* Upload content */}
      <div className="flex flex-col items-center space-y-4">
        
        {/* Icon */}
        <div className={`text-6xl transition-all duration-300 ${
          dragActive 
            ? 'scale-110 animate-bounce' 
            : uploading 
              ? 'animate-pulse'
              : 'hover:scale-105'
        }`}>
          {uploading ? (
            <div className="relative">
              <div className="text-yellow-400">⏳</div>
              <div className="absolute inset-0 animate-spin">
                <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mt-3"></div>
              </div>
            </div>
          ) : dragActive ? (
            <span className="text-cyan-400">⬇️</span>
          ) : (
            <span className="text-gray-400">📁</span>
          )}
        </div>

        {/* Text content */}
        {uploading ? (
          <div className="space-y-2">
            <div className="text-cyan-400 font-medium">
              {enableServerUpload ? `Uploading ${progress}%` : 'Processing STL file...'}
            </div>
            {enableServerUpload && (
              <div className="w-48 bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Please wait...
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className={`text-lg font-medium transition-colors ${
              dragActive ? 'text-cyan-400' : 'text-gray-300'
            }`}>
              {dragActive ? 'Drop your STL file here' : 'Upload STL Model'}
            </div>
            <div className="text-gray-500 text-sm">
              Drag & drop your .stl file or{' '}
              <span className="text-cyan-400 underline">click to browse</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 pt-2">
              <span className="flex items-center">
                ✓ STL format only
              </span>
              <span className="flex items-center">
                ✓ Max 50MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drag overlay effect */}
      {dragActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 animate-pulse pointer-events-none"></div>
      )}
    </div>
  )
}
