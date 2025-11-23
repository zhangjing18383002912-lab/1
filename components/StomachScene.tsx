import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, MeshDistortMaterial, Text, Html, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Phase } from '../types';

// --- Organic Stomach Geometry Construction ---

interface OrganSegmentProps {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity?: number;
  hovered?: boolean;
  onClick?: (e: any) => void;
  onHover?: (state: boolean) => void;
  label?: string;
}

/**
 * Renders a segment of the stomach using a distorted sphere.
 * By combining multiple of these along a curve, we get an organic shape.
 */
const OrganSegment: React.FC<OrganSegmentProps> = ({ 
  position, 
  scale, 
  color, 
  opacity = 1,
  hovered,
  onClick,
  onHover,
  label
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Gentle pulsing for "alive" look
      const t = state.clock.getElapsedTime();
      const breath = 1 + Math.sin(t * 1) * 0.02;
      ref.current.scale.set(scale[0] * breath, scale[1] * breath, scale[2] * breath);
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={ref}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.(true); }}
        onPointerOut={() => onHover?.(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial 
          color={hovered ? "#fbbf24" : color} // Amber when hovered
          speed={2} 
          distort={0.3} // Higher distort for fleshy look
          roughness={0.3}
          metalness={0.1}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      {label && hovered && (
         <Html distanceFactor={6} position={[0, 0, 0]}>
           <div className="bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap backdrop-blur-md">
             {label}
           </div>
         </Html>
      )}
    </group>
  );
};

const Tumor = ({ position }: { position: [number, number, number] }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.scale.setScalar(1 + Math.sin(t * 5) * 0.15); // Fast, angry pulse
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial 
        color="#991b1b" 
        emissive="#7f1d1d"
        emissiveIntensity={0.5}
        roughness={0.8} 
      />
      <Html distanceFactor={8} position={[0.4, 0.4, 0]}>
        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg animate-bounce whitespace-nowrap">
          ⚠️ 肿瘤位置 (Tumor)
        </div>
      </Html>
    </mesh>
  );
};

const RealisticStomach = ({ phase, onPartClick }: { phase: Phase, onPartClick: (p: string) => void }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Define the J-Shape anatomical structure using segments
  // Coordinates tuned for a J-shape: Top center -> Left bulge -> Down -> Right hook
  const segments = useMemo(() => {
    const baseColor = phase === Phase.FRAILTY ? "#cbd5e1" : "#fda4af"; // Pale pink
    
    // Recovery Phase (Discharge): Show a "Remnant Stomach" (smaller, connected to jejunum)
    if (phase === Phase.DISCHARGE) {
      return [
        { id: 'esophagus', label: '食管', pos: [0, 2.2, 0], scale: [0.25, 0.6, 0.25] },
        { id: 'remnant', label: '残胃', pos: [0, 1.2, 0], scale: [0.5, 0.8, 0.5] }, // Much smaller
        { id: 'anastomosis', label: '吻合口', pos: [0, 0.4, 0], scale: [0.3, 0.2, 0.3] },
        { id: 'jejunum', label: '空肠', pos: [0.2, -0.5, 0], scale: [0.25, 1.0, 0.25] }, // Intestine connected
      ].map(s => ({ ...s, color: "#86efac" })); // Light green for recovery
    }

    return [
      // 1. Esophagus (Top Pipe)
      { id: 'esophagus', label: '食管 (Esophagus)', pos: [0.2, 2.5, 0], scale: [0.25, 0.5, 0.25] },
      
      // 2. Cardia (Connection)
      { id: 'cardia', label: '贲门 (Cardia)', pos: [0.15, 1.9, 0], scale: [0.35, 0.35, 0.35] },
      
      // 3. Fundus (Top Left Bulge - critical for "Stomach look")
      { id: 'fundus', label: '胃底 (Fundus)', pos: [-0.6, 1.8, 0.1], scale: [0.7, 0.6, 0.6] },
      
      // 4. Body (Main vertical curve)
      { id: 'body_upper', label: '胃体上部', pos: [-0.5, 1.0, 0], scale: [0.8, 0.7, 0.7] },
      { id: 'body_mid', label: '胃体中部', pos: [-0.4, 0.2, 0], scale: [0.75, 0.7, 0.7] },
      { id: 'body_lower', label: '胃体下部', pos: [-0.2, -0.6, 0], scale: [0.7, 0.6, 0.6] },
      
      // 5. Antrum (Curving Right)
      { id: 'antrum', label: '胃窦 (Antrum)', pos: [0.3, -1.1, 0], scale: [0.6, 0.5, 0.5] },
      
      // 6. Pylorus (Exit valve)
      { id: 'pylorus', label: '幽门 (Pylorus)', pos: [0.9, -1.2, 0], scale: [0.4, 0.3, 0.4] },
      
      // 7. Duodenum (Start of intestine)
      { id: 'duodenum', label: '十二指肠', pos: [1.4, -1.3, 0], scale: [0.25, 0.5, 0.25] },
    ].map(s => ({ ...s, color: baseColor }));
  }, [phase]);

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {segments.map((seg, i) => (
          <OrganSegment
            key={i}
            position={seg.pos as [number, number, number]}
            scale={seg.scale as [number, number, number]}
            color={seg.color}
            label={seg.label}
            hovered={hoveredPart === seg.id}
            onHover={(h) => setHoveredPart(h ? seg.id : null)}
            onClick={() => onPartClick(seg.label)}
          />
        ))}

        {/* Phase Overlays */}
        {phase === Phase.DIAGNOSIS && (
          <Tumor position={[-0.4, -0.5, 0.6]} /> // Tumor in lower body/antrum usually
        )}

        {phase === Phase.HOSPITALIZATION && (
          <group>
             {/* Cut Lines Visualization */}
             <mesh position={[0.2, -0.8, 0]} rotation={[0, 0, 0.5]}>
               <torusGeometry args={[1.2, 0.02, 16, 100]} />
               <meshBasicMaterial color="#333" transparent opacity={0.5} />
             </mesh>
             <Text position={[1.5, 0, 0]} fontSize={0.15} color="#333" backgroundColor="white" p={0.5}>
               手术切除线示意
             </Text>
             <Sparkles count={80} scale={4} size={3} speed={0.4} opacity={0.5} color="#60a5fa" />
          </group>
        )}
      </Float>
    </group>
  );
};

const StomachScene: React.FC<{ phase: Phase, onPartClick: (part: string) => void }> = ({ phase, onPartClick }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-white relative rounded-xl overflow-hidden shadow-inner group touch-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <Environment preset="studio" />
        
        <ambientLight intensity={0.7} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={0.8} castShadow />
        
        {/* The Realistic Model */}
        <RealisticStomach phase={phase} onPartClick={onPartClick} />

        {/* Controls */}
        <OrbitControls 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={8} 
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {phase === Phase.FRAILTY && <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade />}
      </Canvas>

      {/* Video / Interactive Badge */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-10 pointer-events-none">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold tracking-widest">3D INTERACTIVE</span>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-xs text-slate-400 bg-white/50 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
          {phase === Phase.DISCHARGE ? "当前展示：术后残胃解剖结构" : "当前展示：胃部解剖与病灶位置"}
        </p>
      </div>
    </div>
  );
};

export default StomachScene;