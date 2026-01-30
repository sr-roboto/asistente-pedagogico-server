import React from 'react';
import Logo from '../components/ui/Logo';

const WelcomeScreen = ({ onStart }) => {
    return (
        <div className="h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-teal-50 to-teal-100 animate-fade-in cursor-pointer" onClick={onStart}>
            <div className="w-full"><Logo /></div>

            <div className="flex flex-col items-center text-center space-y-8 mb-20 relative">
                <h2 className="text-6xl text-teal-900 font-serif tracking-wide relative z-10">AVATAR<br />IA</h2>
                <div className="w-24 h-24 bg-yellow-400 rounded-full opacity-20 absolute top-1/3 right-10 animate-pulse"></div>
                <p className="text-teal-700 text-lg font-medium animate-bounce mt-10">Presiona la pantalla<br />para empezar</p>
            </div>

            <div className="w-full h-2 bg-teal-200 rounded-full mb-4"></div>
        </div>
    );
};

export default WelcomeScreen;
