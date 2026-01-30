import React from 'react';
import Logo from '../components/ui/Logo';
import ButtonCard from '../components/ui/ButtonCard';

const GradeSelectionScreen = ({ onSelect }) => {
    return (
        <div className="h-full flex flex-col bg-teal-50 p-6 animate-slide-up">
            <Logo />
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <h2 className="text-4xl text-teal-900 font-serif text-center">AVATAR IA</h2>
                <p className="text-teal-700 text-center text-lg">Selecciona un grado de estudio</p>

                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                    <ButtonCard
                        title="Primaria"
                        color="bg-blue-400"
                        icon={<span className="text-4xl">🎒</span>}
                        onClick={() => onSelect('primaria')}
                    />
                    <ButtonCard
                        title="Secundaria"
                        color="bg-purple-400"
                        icon={<span className="text-4xl">📚</span>}
                        onClick={() => onSelect('secundaria')}
                    />
                </div>
            </div>
        </div>
    );
};

export default GradeSelectionScreen;
