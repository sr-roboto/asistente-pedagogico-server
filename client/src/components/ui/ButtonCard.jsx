import React from 'react';

const ButtonCard = ({ title, icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full p-6 rounded-3xl shadow-lg transform transition-all active:scale-95 flex flex-col items-center justify-center gap-4 ${color} text-white hover:brightness-110`}
    >
        <div className="bg-white/20 p-4 rounded-full">
            {icon}
        </div>
        <span className="text-xl font-bold">{title}</span>
    </button>
);

export default ButtonCard;
