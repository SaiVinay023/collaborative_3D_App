import React, { useRef, useState, useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

export default function STLViewer({ modelUrl, annotations = [], onAddAnnotation }) {
  const meshRef = useRef()
  const { camera, gl, scene } = useThree()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [model, setModel] = useState(null)

  // Load STL
  useEffect(() => {
    if (!modelUrl) return

    setLoading(true)
    const loader = new STLLoader()
    loader.load(
      modelUrl,
      (geometry) => {
        setModel(geometry)
        setLoading(false)
      },
      undefined,
      () => setError(true)
    )
  }, [modelUrl])

  // Add annotation on click
  const handlePointerDown = (e) => {
    e.stopPropagation()
    if (!onAddAnnotation) return
    const point = e.point.clone()
    onAddAnnotation({ position: [point.x, point.y, point.z], text: 'New annotation' })
  }

  if (error)
    return (
      <Html center>
        <div style={{ color: 'red' }}>Failed to load STL</div>
      </Html>
    )

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />

      {model && (
        <mesh
          ref={meshRef}
          geometry={model}
          onPointerDown={handlePointerDown}
        >
          <meshStandardMaterial color="orange" metalness={0.3} roughness={0.7} />
        </mesh>
      )}

      {loading && (
        <Html center>
          <div style={{ background: 'white', padding: '5px', borderRadius: '5px' }}>Loading...</div>
        </Html>
      )}

      {annotations.map((anno, idx) => (
        <Html key={idx} position={anno.position}>
          <div
            style={{
              background: 'yellow',
              padding: '2px 4px',
              borderRadius: '4px',
              fontSize: '12px',
              pointerEvents: 'none',
            }}
          >
            {anno.text}
          </div>
        </Html>
      ))}

      <OrbitControls enablePan enableRotate enableZoom />
    </>
  )
}
