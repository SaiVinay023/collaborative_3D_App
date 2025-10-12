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
  const [errorMessage, setErrorMessage] = useState('')

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
    console.log('🔍 STLViewer received modelUrl:', modelUrl)
    
    if (!modelUrl) {
      console.log('❌ No modelUrl provided to STLViewer')
      setModel(null)
      setLoading(false)
      setError(false)
      return
    }

    console.log('🔄 Starting STL load from URL:', modelUrl)
    console.log('🔍 URL breakdown:', {
      protocol: modelUrl.split('://')[0],
      host: modelUrl.split('://')[1]?.split('/')[0],
      path: modelUrl.split('://')[1]?.split('/').slice(1).join('/')
    })

    setLoading(true)
    setError(false)
    setErrorMessage('')
    
    const loader = new STLLoader()
    
    // Test URL accessibility first
    fetch(modelUrl, { method: 'HEAD' })
      .then(response => {
        console.log('🔍 URL accessibility test:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // If URL is accessible, proceed with STL loading
        return loader.load(
          modelUrl,
          (geometry) => {
            console.log('✅ STL loaded successfully!')
            console.log('📊 Geometry info:', {
              vertices: geometry.attributes.position.count,
              hasNormals: !!geometry.attributes.normal,
              boundingBox: geometry.boundingBox
            })
            
            // Center and scale geometry
            geometry.center()
            geometry.computeBoundingBox()
            const box = geometry.boundingBox
            const size = new THREE.Vector3()
            box.getSize(size)
            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 4 / maxDim
            
            console.log('🔧 Scaling geometry:', {
              originalSize: { x: size.x, y: size.y, z: size.z },
              maxDim,
              scaleFactor: scale
            })
            
            geometry.scale(scale, scale, scale)
            
            // Ensure normals exist for proper lighting
            if (!geometry.attributes.normal) {
              geometry.computeVertexNormals()
            }
            
            setModel(geometry)
            setLoading(false)
            console.log('🎉 STL model ready for rendering!')
          },
          (progress) => {
            if (progress.total > 0) {
              const percent = Math.round((progress.loaded / progress.total) * 100)
              console.log(`📊 Loading progress: ${percent}% (${progress.loaded}/${progress.total} bytes)`)
            }
          },
          (error) => {
            console.error('❌ STL loading failed:', error)
            console.error('❌ Failed URL:', modelUrl)
            console.error('❌ Error details:', {
              message: error.message,
              type: error.constructor.name,
              stack: error.stack
            })
            
            setError(true)
            setErrorMessage(error.message || 'Unknown loading error')
            setLoading(false)
          }
        )
      })
      .catch(fetchError => {
        console.error('❌ URL accessibility test failed:', fetchError)
        console.error('❌ This usually means:', {
          'CORS issues': 'Server not serving files with proper headers',
          'File not found': 'STL file doesn\'t exist at the URL',
          'Server not running': 'Backend server is not accessible',
          'Wrong port': 'Port mismatch between frontend and backend'
        })
        
        setError(true)
        setErrorMessage(`File not accessible: ${fetchError.message}`)
        setLoading(false)
      })

  }, [modelUrl])

  // Handle clicks for annotations
  const handlePointerDown = (e) => {
    e.stopPropagation()
    console.log('🎯 Model clicked at position:', e.point)
    
    if (!onAddAnnotation || !model) {
      console.log('❌ Cannot add annotation:', { onAddAnnotation: !!onAddAnnotation, model: !!model })
      return
    }
    
    const point = e.point.clone()
    const annotation = { 
      position: [point.x, point.y, point.z], 
      text: 'An example annotation for the Designo exercise.',
      user: 'Designer'
    }
    
    console.log('📍 Adding annotation:', annotation)
    onAddAnnotation(annotation)
  }

  // Show error state with detailed message
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

  // Show loading state with enhanced animation
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
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

  // ONLY render 3D model if it exists (no fallback cube!)
  if (!model) {
    console.log('⏳ STLViewer waiting for model...')
    return null // Don't render anything if no model
  }

  console.log('🎨 Rendering 3D model with', annotations.length, 'annotations')

  return (
    <>
      {/* 3D Model (ONLY when loaded) */}
      <mesh
        ref={meshRef}
        geometry={model}
        onPointerDown={handlePointerDown}
        castShadow
        receiveShadow
        onPointerEnter={() => console.log('🖱️ Mouse entered model')}
        onPointerLeave={() => console.log('🖱️ Mouse left model')}
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
      {annotations.map((anno, idx) => {
        console.log(`📍 Rendering annotation ${idx + 1}:`, anno)
        return (
          <Html key={idx} position={anno.position}>
            <div style={{ position: 'relative' }}>
              {/* Numbered marker */}
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
              {/* Modern tooltip */}
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
        )
      })}

      <OrbitControls 
        enablePan 
        enableRotate 
        enableZoom
        minDistance={3}
        maxDistance={20}
        enableDamping
        dampingFactor={0.05}
        onStart={() => console.log('🎮 Camera control started')}
        onEnd={() => console.log('🎮 Camera control ended')}
      />
    </>
  )
}
