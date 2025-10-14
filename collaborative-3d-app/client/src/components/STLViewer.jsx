import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls, Html, TransformControls } from '@react-three/drei'
import * as THREE from 'three'

export default function STLViewer({
  modelUrl,
  annotations = [],
  onAddAnnotation,
  position = { x: 0, y: 0, z: 0 },
  setPosition
}) {
  const meshRef = useRef()
  const { scene } = useThree()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [model, setModel] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Lighting setup
  useEffect(() => {
    scene.background = new THREE.Color(0x1a1a1a)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)
    const keyLight = new THREE.DirectionalLight(0x00d4ff, 1.2)
    keyLight.position.set(5, 8, 5)
    keyLight.castShadow = true
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5)
    rimLight.position.set(-5, 2, -5)
    scene.add(rimLight)
    return () => {
      scene.remove(ambientLight, keyLight, rimLight)
    }
  }, [scene])

  // STL loading (with HEAD fetch)
  useEffect(() => {
    if (!modelUrl) {
      setModel(null)
      setLoading(false)
      setError(false)
      return
    }
    setLoading(true)
    setError(false)
    setErrorMessage('')
    const loader = new STLLoader()
    fetch(modelUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        loader.load(
          modelUrl,
          (geometry) => {
            geometry.center()
            geometry.computeBoundingBox()
            const box = geometry.boundingBox
            const size = new THREE.Vector3()
            box.getSize(size)
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 4 / maxDim
            geometry.scale(scale, scale, scale)
            if (!geometry.attributes.normal) geometry.computeVertexNormals()
            setModel(geometry)
            setLoading(false)
          },
          undefined,
          (error) => {
            setError(true)
            setErrorMessage(error.message || 'Unknown loading error')
            setLoading(false)
          }
        )
      })
      .catch(fetchError => {
        setError(true)
        setErrorMessage(`File not accessible: ${fetchError.message}`)
        setLoading(false)
      })
  }, [modelUrl])

  // Add annotation on click
  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (!onAddAnnotation || !model) return
    const point = e.point.clone()
    const annotation = {
      position: [point.x, point.y, point.z],
      text: 'An example annotation for the Designo exercise.',
      user: 'Designer'
    }
    onAddAnnotation(annotation)
  }

  // Sync position to parent state after dragging with TransformControls
  const onObjectChange = () => {
    if (meshRef.current && setPosition) {
      const { x, y, z } = meshRef.current.position
      setPosition({ x, y, z })
    }
  }

  // Render loading/error states
  if (error) {
    return (
      <Html center>
        <div style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '16px',
          borderRadius: '8px',
          maxWidth: '300px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            ❌ Failed to load 3D model
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {errorMessage}
          </div>
          <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.6 }}>
            Check console for detailed error info
          </div>
        </div>
      </Html>
    )
  }

  if (loading) {
    return (
      <Html center>
        <div style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid #00d4ff',
          color: '#00d4ff',
          padding: '16px',
          borderRadius: '8px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #00d4ff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Loading STL model...</span>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Html>
    )
  }

  if (!model) return null

  // Main render: 3D model with drag-to-move
  return (
    <>
      <TransformControls
        object={meshRef}
        mode="translate"
        showX
        showY
        showZ
        onObjectChange={onObjectChange}
      >
        <mesh
          ref={meshRef}
          geometry={model}
          position={[position.x, position.y, position.z]}
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
      </TransformControls>

      {/* Annotations */}
      {annotations.map((anno, idx) => (
        <Html key={idx} position={anno.position}>
          <div style={{ position: 'relative' }}>
            <div
              className="annotation-marker"
              style={{
                width: '24px',
                height: '24px',
                background: '#00d4ff',
                border: '2px solid #0f0f0f',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f0f0f',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {idx + 1}
            </div>
            <div
              className="annotation-tooltip"
              style={{
                position: 'absolute',
                left: '30px',
                top: '-8px',
                whiteSpace: 'nowrap',
                background: 'rgba(0, 0, 0, 0.85)',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '12px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                maxWidth: '200px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#00d4ff' }}>
                {anno.title || 'Model Annotation'}
              </div>
              <div style={{ opacity: 0.8 }}>
                {anno.text}
              </div>
              {anno.user && (
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
                  by {anno.user}
                </div>
              )}
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
