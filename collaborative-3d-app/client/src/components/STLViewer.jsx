import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

export default function STLViewer({ modelUrl, annotations = [], onAddAnnotation }) {
  const meshRef = useRef()
  const { scene } = useThree()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [model, setModel] = useState(null)

  // Enhanced lighting setup for modern look
  useEffect(() => {
    scene.background = new THREE.Color(0x1a1a1a) // Dark background
    
    // Add subtle ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)
    
    // Add key light (bright, from front-top)
    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1.2)
    keyLight.position.set(5, 8, 5)
    keyLight.castShadow = true
    scene.add(keyLight)
    
    // Add rim light (cyan accent)
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5)
    rimLight.position.set(-5, 2, -5)
    scene.add(rimLight)
    
    return () => {
      scene.remove(ambientLight, keyLight, rimLight)
    }
  }, [scene])

  // Load STL ONLY when modelUrl is provided
  useEffect(() => {
    if (!modelUrl) {
      setModel(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)
    
    const loader = new STLLoader()
    loader.load(
      modelUrl,
      (geometry) => {
        // Center and scale geometry
        geometry.center()
        const box = new THREE.Box3().setFromObject({ geometry })
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 4 / maxDim
        geometry.scale(scale, scale, scale)
        
        setModel(geometry)
        setLoading(false)
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%')
      },
      (error) => {
        console.error('STL loading failed:', error)
        setError(true)
        setLoading(false)
      }
    )
  }, [modelUrl])

  // Handle clicks for annotations
  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (!onAddAnnotation || !model) return
    const point = e.point.clone()
    onAddAnnotation({ 
      position: [point.x, point.y, point.z], 
      text: 'An example annotation for the Designo exercise.',
      user: 'Designer'
    })
  }

  // Show error state
  if (error) {
    return (
      <Html center>
        <div className="annotation-tooltip">
          ❌ Failed to load 3D model
        </div>
      </Html>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <Html center>
        <div className="annotation-tooltip">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
            Loading STL model...
          </div>
        </div>
      </Html>
    )
  }

  // ONLY render 3D model if it exists (no fallback cube!)
  if (!model) {
    return null // Don't render anything if no model
  }

  return (
    <>
      {/* 3D Model (ONLY when loaded) */}
      <mesh
        ref={meshRef}
        geometry={model}
        onPointerDown={handlePointerDown}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial 
          color={0x00d4ff}
          metalness={0.7}
          roughness={0.2}
          wireframe={false}
          transparent={true}
          opacity={0.9}
          emissive={0x001122}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Modern Annotations */}
      {annotations.map((anno, idx) => (
        <Html key={idx} position={anno.position}>
          <div style={{ position: 'relative' }}>
            {/* Numbered marker */}
            <div className="annotation-marker">
              {idx + 1}
            </div>
            {/* Modern tooltip */}
            <div 
              className="annotation-tooltip"
              style={{ 
                position: 'absolute', 
                left: '25px', 
                top: '-8px',
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Model Annotation
              </div>
              <div style={{ opacity: 0.8 }}>
                {anno.text}
              </div>
            </div>
          </div>
        </Html>
      ))}

      <OrbitControls 
        enablePan 
        enableRotate 
        enableZoom
        minDistance={3}
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}
