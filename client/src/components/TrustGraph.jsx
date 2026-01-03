import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const Node = ({ position, color, label, size = 1 }) => {
    const mesh = useRef();

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={position}>
            <mesh ref={mesh}>
                <icosahedronGeometry args={[size, 1]} />
                <meshStandardMaterial color={color} wireframe />
                <meshStandardMaterial color={color} transparent opacity={0.3} />
            </mesh>
            <Html distanceFactor={10}>
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md border border-white/20 whitespace-nowrap">
                    {label}
                </div>
            </Html>
        </group>
    );
};

const Connection = ({ start, end, color }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

    return (
        <Line
            points={points}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.5}
        />
    );
};

const TrustGraph = ({ analysisResult }) => {
    const { matchedClaims, aiAnalysis } = analysisResult;

    // Central Node: The Claim
    const centerNode = { pos: [0, 0, 0], color: '#ffffff', label: 'Claim' };

    // Generate Nodes for Fact Checks (Google API)
    const factNodes = (matchedClaims || []).map((claim, i) => {
        const angle = (i / (matchedClaims.length || 1)) * Math.PI * 2;
        const radius = 4;
        return {
            pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
            color: claim.claimReview[0].textualRating.toLowerCase().includes('false') ? '#ef4444' : '#10b981',
            label: claim.claimant || 'Source'
        };
    });

    // AI Node
    const aiNode = aiAnalysis ? {
        pos: [0, 5, 0],
        color: aiAnalysis.trustScore > 60 ? '#8b5cf6' : '#ec4899', // Purple or Pink
        label: 'AI Verdict'
    } : null;

    return (
        <div className="h-64 wc-full bg-black/20 rounded-xl overflow-hidden border border-white/10 mt-6 relative group">
            <div className="absolute top-2 left-2 z-10 text-xs text-gray-400 pointer-events-none group-hover:opacity-0 transition-opacity">
                drag to rotate 3D view
            </div>
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />

                {/* Render Center */}
                <Node {...centerNode} size={1.5} />

                {/* Render Facts */}
                {factNodes.map((node, i) => (
                    <React.Fragment key={i}>
                        <Node {...node} />
                        <Connection start={centerNode.pos} end={node.pos} color={node.color} />
                    </React.Fragment>
                ))}

                {/* Render AI */}
                {aiNode && (
                    <>
                        <Node {...aiNode} size={1.2} />
                        <Connection start={centerNode.pos} end={aiNode.pos} color={aiNode.color} />
                    </>
                )}
            </Canvas>
        </div>
    );
};

export default TrustGraph;
