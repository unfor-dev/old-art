// Original concept by Tom Bogner @dastom on Dribble: https://dribbble.com/shots/6767548-The-Three-Graces-Concept

import { useRef } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useGLTF, SoftShadows, Html, CameraControls, Environment } from '@react-three/drei'
import { easing, geometry } from 'maath'
import { DirectionalLight } from 'three'

// Extend drei with custom geometry
extend(geometry)

export default function App() {
  return (
    <Canvas
      shadows="basic"
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      camera={{ position: [0, 1.5, 14], fov: 45 }}
    >
      {/* Add fog to the scene for depth effect */}
      <fog attach="fog" args={['black', 0, 20]} />
      {/* Background point lights for ambient illumination */}
      <pointLight position={[10, 10, -20]} intensity={10} />
      <pointLight position={[10, -10, 2]} intensity={5} />
      {/* Main 3D model */}
      <Model scale={0.2} position={[0, -5.5, 3]} rotation={[0, -0.2, 0]} />
      {/* Camera controls for user interaction */}
      <CameraControls
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 2}
        maxAzimuthAngle={Math.PI / 2}
      />
    </Canvas>
  )
}

// Model component: loads and animates the 3D model, adds lighting and annotations
function Model(props) {
  const group = useRef()
  const light = useRef()
  // Load the GLTF model
  const { nodes, materials } = useGLTF('/dragon_circle.glb')
  // Animate model and light based on pointer movement
  useFrame((state, delta) => {
    // Smoothly rotate the model based on pointer X
    easing.dampE(group.current.rotation, [-0.5, -state.pointer.x * (Math.PI / 10), 0], 1.5, delta)
    // Smoothly move the model up/down based on pointer X
    easing.damp3(group.current.position, [0, -0.5, 1 - Math.abs(state.pointer.x)], 1, delta)
    // Move the spotlight based on pointer position
    easing.damp3(light.current.position, [state.pointer.x * 12, 0, 8 + state.pointer.y * 4], 0.2, delta)
  })
  return (
    <group ref={group} {...props}>
      {/* Main mesh of the model */}
      <mesh
        name="Object_2"
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials.degon_circle_reuv_u1_v1}
        position={[4.381, -4.093, 0]}
        rotation={[Math.PI / 2, 0, -Math.PI]}
      >
        {/* <meshLambertMaterial color="#404044" roughness={0.1} metalness={1} /> */}
      </mesh>
      {/* Main spotlight for dramatic lighting and shadows */}
      <spotLight
        angle={0.5}
        penumbra={0.5}
        ref={light}
        castShadow
        intensity={10}
        shadow-mapSize={1024}
        shadow-bias={-0.001}
      >
        {/* Orthographic camera for shadow mapping */}
        <orthographicCamera attach="shadow-camera" args={[10, 10, 10, 10, 0.1, 50]} />
      </spotLight>
      <directionalLight intensity={2} />
    </group>
  )
}

// Annotation component: displays a label above the model
function Annotation({ children, ...props }) {
  return (
    <Html
      {...props}
      transform
      occlude="blending"
      geometry={
        // Optional: use rounded plane geometry for annotation background
        <roundedPlaneGeometry args={[1.66, 0.47, 0.24]} />
      }
    >
    </Html>
  )
}