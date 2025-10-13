import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const useProject = () => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`)
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const createProject = async (title) => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      const newProject = await response.json()
      setProjects(prev => [newProject, ...prev])
      setCurrentProject(newProject)
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  const uploadModel = async (projectId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    try {
      const response = await fetch(`${API_URL}/projects/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      setCurrentProject(prev => ({
        ...prev,
        modelUrl: result.modelUrl
      }))

      fetchProjects()
      return result
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  return {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    uploadModel,
    fetchProjects
  }
}
