import React from 'react';
import Logo from '../components/ui/Logo';

const LoadingScreen = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-teal-50">
            <Logo />
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mb-8"></div>
                <h2 className="text-4xl font-serif text-teal-800 animate-pulse">Cargando</h2>
            </div>
        </div>
    );
};

export default LoadingScreen;
