import React from 'react';

const HumanAvatar = ({ isTalking }) => (
    <svg viewBox="0 0 200 240" className="w-64 h-64 mx-auto drop-shadow-2xl">
        <g className={`transition-transform duration-700 ${isTalking ? 'animate-nod' : ''}`}>
            {/* Pelo Detrás */}
            <path d="M 60 80 Q 50 150 40 180 L 160 180 Q 150 150 140 80" fill="#4a3b32" />

            {/* Cuello */}
            <rect x="85" y="130" width="30" height="40" fill="#eec0a6" />

            {/* Ropa */}
            <path d="M 40 240 L 40 170 Q 100 190 160 170 L 160 240 Z" fill="#1e293b" />
            <path d="M 100 170 L 100 240" stroke="#cbd5e1" strokeWidth="1" opacity="0.2" />
            <path d="M 85 170 L 100 190 L 115 170" fill="white" /> {/* Cuello Camisa */}

            {/* Cara */}
            <ellipse cx="100" cy="100" rx="45" ry="55" fill="#f5d0b9" />

            {/* Gafas */}
            <g stroke="#1e1e1e" strokeWidth="2" fill="none">
                <circle cx="82" cy="95" r="14" />
                <circle cx="118" cy="95" r="14" />
                <line x1="96" y1="95" x2="104" y2="95" />
            </g>

            {/* Ojos */}
            <circle cx="82" cy="95" r="3" fill="#333" />
            <circle cx="118" cy="95" r="3" fill="#333" />

            {/* Boca */}
            {isTalking ? (
                <ellipse cx="100" cy="130" rx="10" ry="4" fill="#be123c" />
            ) : (
                <path d="M 85 130 Q 100 140 115 130" stroke="#be123c" strokeWidth="2" fill="none" />
            )}

            {/* Pelo Frente */}
            <path d="M 55 100 Q 60 40 100 40 Q 140 40 145 100 Q 140 50 100 50 Q 60 50 55 100" fill="#5D4037" />
        </g>
    </svg>
);

export default HumanAvatar;
