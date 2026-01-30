import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Mic, Keyboard, Send, X, Globe } from 'lucide-react';
import Logo from '../components/ui/Logo';
import RobotAvatar from '../components/avatars/RobotAvatar';
import HumanAvatar from '../components/avatars/HumanAvatar';

const ChatScreen = ({ subject, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [isAvatarTalking, setIsAvatarTalking] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initial greeting
        const timer = setTimeout(() => {
            addMessage('bot', '¡Hola vecino! ¿Cómo te sientes hoy? ¡Qué alegría saludarte!');
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addMessage = (sender, text) => {
        if (sender === 'bot') {
            setIsAvatarTalking(true);
            setTimeout(() => setIsAvatarTalking(false), 3000); // Talk for 3s or based on text length
        }
        setMessages(prev => [...prev, { sender, text }]);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        const userMessage = inputText;
        addMessage('user', userMessage);
        setInputText('');
        setShowInput(false);

        // Simulate generic response for now, will replace with API call
        // setTimeout(() => {
        //   addMessage('bot', '¡Entiendo! Estoy aquí para ayudarte con lo que necesites sobre esa tarea.');
        // }, 1500);

        // Call Backend API
        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, subject: subject })
            });
            if (response.ok) {
                const data = await response.json();
                addMessage('bot', data.response);
            } else {
                addMessage('bot', 'Lo siento, tuve un problema al conectar con mi cerebro.');
            }
        } catch (error) {
            console.error(error);
            addMessage('bot', 'Error de conexión. ¿Está encendido el servidor?');
        }
    };

    return (
        <div className="h-full flex flex-col bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')" }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-sm z-0"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-4">
                <button onClick={onBack} className="p-2 bg-black/20 rounded-full text-white hover:bg-black/30 transition">
                    <ChevronLeft size={28} />
                </button>
                <div className="bg-white/90 px-4 py-2 rounded-xl shadow-lg">
                    <Logo />
                </div>
                <button className="p-2 bg-black/20 rounded-full text-white">
                    <Globe size={28} />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8">

                {/* Chat Bubbles */}
                <div className="w-full px-6 mb-4 space-y-2 flex flex-col items-center overflow-y-auto max-h-[40vh] no-scrollbar">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`max-w-[90%] p-4 rounded-2xl shadow-lg backdrop-blur-md animate-pop-in 
                ${msg.sender === 'bot'
                                    ? 'bg-black/70 text-white rounded-bl-none border-l-4 border-yellow-400'
                                    : 'bg-white text-gray-800 rounded-br-none self-end'}`}
                        >
                            <p className="text-lg font-medium leading-relaxed">{msg.text}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Avatar */}
                <div className="mb-4 transform scale-110">
                    {subject === 'matematica' ? (
                        <RobotAvatar isTalking={isAvatarTalking} />
                    ) : (
                        <HumanAvatar isTalking={isAvatarTalking} />
                    )}
                </div>

                {/* Action Buttons */}
                {!showInput && (
                    <div className="w-full px-6 space-y-3">
                        <button className="w-full bg-gradient-to-r from-lime-400 to-green-500 p-4 rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform">
                            <Mic className="text-white" fill="white" />
                            <span className="text-white font-bold text-xl uppercase tracking-wide">Haz tu consulta aquí</span>
                        </button>

                        <button
                            onClick={() => setShowInput(true)}
                            className="w-full bg-white p-4 rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
                        >
                            <Keyboard className="text-gray-600" />
                            <span className="text-gray-600 font-bold text-xl uppercase tracking-wide">Escríbeme aquí</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Input Overlay */}
            {showInput && (
                <div className="absolute inset-x-0 bottom-0 bg-white z-20 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-slide-up">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-medium ml-2">Escribe tu consulta</span>
                        <button onClick={() => setShowInput(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Hola, ¿qué es un vector?"
                            className="flex-1 bg-gray-100 p-4 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            autoFocus
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-teal-600 text-white p-4 rounded-2xl hover:bg-teal-700 transition active:scale-95"
                        >
                            <Send />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatScreen;
