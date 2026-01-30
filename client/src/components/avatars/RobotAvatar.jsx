import React from 'react';

const RobotAvatar = ({ isTalking }) => (
    <svg viewBox="0 0 200 240" className="w-64 h-64 mx-auto drop-shadow-2xl">
        <g className={`transition-transform duration-500 ${isTalking ? 'animate-bounce-slight' : 'animate-float'}`}>
            {/* Antena */}
            <line x1="100" y1="20" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="4" />
            <circle cx="100" cy="20" r="6" fill="#3b82f6" className="animate-pulse" />

            {/* Cabeza */}
            <rect x="50" y="50" width="100" height="80" rx="20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            {/* Cara/Pantalla */}
            <rect x="60" y="65" width="80" height="50" rx="10" fill="#1e293b" />
            {/* Ojos */}
            <circle cx="80" cy="85" r="6" fill="#60a5fa" className={isTalking ? "animate-blink" : ""} />
            <circle cx="120" cy="85" r="6" fill="#60a5fa" className={isTalking ? "animate-blink" : ""} />
            {/* Boca */}
            {isTalking ? (
                <path d="M 85 100 Q 100 110 115 100" stroke="#60a5fa" strokeWidth="3" fill="none" className="animate-talk" />
            ) : (
                <path d="M 85 100 Q 100 110 115 100" stroke="#60a5fa" strokeWidth="3" fill="none" />
            )}

            {/* Cuerpo */}
            <path d="M 60 140 Q 50 200 60 220 L 140 220 Q 150 200 140 140 Z" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            {/* Brazos */}
            <path d="M 55 160 Q 30 180 40 200" stroke="white" strokeWidth="12" strokeLinecap="round" />
            <path d="M 145 160 Q 170 180 160 200" stroke="white" strokeWidth="12" strokeLinecap="round" />
        </g>
    </svg>
);

export default RobotAvatar;
