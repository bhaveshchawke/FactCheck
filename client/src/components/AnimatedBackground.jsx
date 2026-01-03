import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 3000 }) {
    const points = useRef();

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, [count]);

    useFrame((state, delta) => {
        if (points.current) {
            points.current.rotation.x += delta * 0.02;
            points.current.rotation.y += delta * 0.03;
        }
    });

    return (
        <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#10b981"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function FloatingOrb({ position, color, scale = 1 }) {
    const mesh = useRef();

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
            mesh.current.rotation.x += 0.005;
            mesh.current.rotation.z += 0.005;
        }
    });

    return (
        <mesh ref={mesh} position={position} scale={scale}>
            <icosahedronGeometry args={[1, 2]} />
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.15}
                wireframe
            />
        </mesh>
    );
}

const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <StarField />

                <FloatingOrb position={[-3, 1, -2]} color="#10b981" scale={0.8} />
                <FloatingOrb position={[3, -1, -3]} color="#3b82f6" scale={1.2} />
                <FloatingOrb position={[0, 2, -4]} color="#8b5cf6" scale={0.6} />
            </Canvas>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/50 to-dark pointer-events-none" />
        </div>
    );
};

export default AnimatedBackground;
