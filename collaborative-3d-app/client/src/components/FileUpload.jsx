import React, { useState, useRef } from 'react'
import axios from 'axios'

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
        const res = await axios.post('/api/projects/upload', formData, {
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
      className={`upload-zone ${dragActive ? 'active' : ''}`}
      onClick={() => inputRef.current.click()}
      {...(enableDragDrop
        ? {
            onDragEnter: handleDrag,
            onDragOver: handleDrag,
            onDragLeave: handleDrag,
            onDrop: handleDrop,
          }
        : {})}
      style={{
        border: '2px dashed gray',
        padding: '20px',
        textAlign: 'center',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".stl"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />

      {uploading
        ? <p>{enableServerUpload ? `Uploading ${progress}%` : 'Processing...'}</p>
        : <p>Drag STL file here or click to upload</p>}
    </div>
  )
}
