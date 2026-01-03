import React from 'react';
import { motion } from 'framer-motion';

const ScoreMeter = ({ score }) => {
    // Score is 0-100
    // Color mapping
    let color = '#ef4444'; // Red
    let label = 'Fake';
    if (score >= 70) {
        color = '#10b981'; // Green
        label = 'Real';
    } else if (score >= 40) {
        color = '#f59e0b'; // Yellow
        label = 'Doubtful';
    }

    // SVG arc calculation
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="relative h-48 w-48">
                {/* Background Circle */}
                <svg className="h-full w-full rotate-[-90deg]">
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke="#1e293b"
                        strokeWidth="12"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96"
                        cy="96"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color }}>{Math.round(score)}</span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md"
                style={{ backgroundColor: `${color}20`, borderColor: `${color}50`, color }}
            >
                <span className="font-bold text-lg uppercase tracking-wider">{label}</span>
            </motion.div>
        </div>
    );
};

export default ScoreMeter;
