import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Mic, Volume2, VolumeX, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ... (existing imports/interfaces)

// ... (existing imports/interfaces)

// Scroll down to render logic

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking';

const ThinkingRobot = ({ state }: { state: RobotState }) => {
    // Talking animation state (cycles 0, 1, 2)
    const [talkingFrame, setTalkingFrame] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'speaking') {
            interval = setInterval(() => {
                setTalkingFrame(prev => (prev + 1) % 2);
            }, 200);
        } else {
            setTalkingFrame(0);
        }
        return () => clearInterval(interval);
    }, [state]);

    const getImage = () => {
        switch (state) {
            case 'listening': return "/2.png";
            case 'thinking': return "/6.png";
            case 'speaking':
                return talkingFrame === 0 ? "/3.png" : "/4.png";
            default: return "/1.png";
        }
    };

    return (
        <div className="relative w-full h-full">
            <img
                src={getImage()}
                alt="Tomi Avatar"
                className="w-full h-full object-contain drop-shadow-2xl relative z-10 transition-all duration-300"
            />
            {state === 'thinking' && (
                <div className="absolute top-[0%] right-[30%] z-20 bg-white/90 p-2 rounded-full shadow-lg animate-bounce">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                </div>
            )}
        </div>
    );
};

// Helper: Clean markdown for speech
const cleanTextForSpeech = (text: string): string => {
    // Remove bold/italic markers
    let clean = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/_/g, '');
    // Remove headers
    clean = clean.replace(/#{1,6}\s?/g, '');
    // Remove links [text](url) -> text
    clean = clean.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // Remove code blocks
    clean = clean.replace(/```[\s\S]*?```/g, 'código');
    // Replace list dashes with pauses
    clean = clean.replace(/^\s*-\s+/gm, ', ');

    return clean;
};

const AIChat = () => {
    // navigate removed as it is the main page now
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '¡Hola! Soy Tomi. ¿Qué te gustaría saber o hacer hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Removed messagesEndRef as we don't have scrolling chat anymore
    const abortControllerRef = useRef<AbortController | null>(null);

    const [subtitle, setSubtitle] = useState('');

    const speakText = (text: string) => {
        if (isMuted || !window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const cleanText = cleanTextForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'es-ES';
        // Select a good voice if available (optional)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('es') && v.name.includes('Google')) || voices.find(v => v.lang.includes('es'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setSubtitle(""); // Start empty or with first chunk
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word' || event.name === 'sentence') {
                const charIndex = event.charIndex;
                const text = utterance.text;
                const delimiters = ['.', '?', '!', '\n', ',', ';', ':', '—'];

                // Find start of current chunk
                let start = 0;
                for (let i = charIndex - 1; i >= 0; i--) {
                    if (delimiters.includes(text[i])) {
                        start = i + 1;
                        break;
                    }
                }

                // Find end of current chunk
                let end = text.length;
                for (let i = charIndex; i < text.length; i++) {
                    if (delimiters.includes(text[i])) {
                        // Include the delimiter for valid sentence endings if it's not a comma/pause
                        // But usually for subtitles we might want to just show the text. 
                        // Let's include the delimiter to look natural.
                        end = i + 1;
                        break;
                    }
                }

                const currentChunk = text.substring(start, end).trim();
                // Avoid empty updates or single punctuation
                if (currentChunk && currentChunk.length > 1) {
                    setSubtitle(currentChunk);
                }
            }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setSubtitle(''); // Clear subtitle to show full text or nothing
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSubtitle('');
    };

    const scrollToBottom = () => {
        // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Removed as per new UI
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleVoiceInput = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                // Auto-submit for better voice experience
                setTimeout(() => {
                    // We call handle submit directly passing the transcript to ensure state is fresh if needed
                    triggerSubmit(transcript);
                }, 500);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => setIsListening(false);

            recognition.start();
        } else {
            alert("Tu navegador no soporta reconocimiento de voz.");
        }
    };

    // Wrapper to trigger submit from outside form event
    const triggerSubmit = (text: string) => {
        const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
        handleSubmit(fakeEvent, text);
    };

    const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
        e.preventDefault();
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        // Stop any current speech
        stopSpeaking();

        const userMessage = textToSend.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        // Add placeholder for assistant message
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            abortControllerRef.current = new AbortController();
            const response = await fetch('http://localhost:8000/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error('Error connecting to AI');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;

                // Update the last message (assistant) with the growing response
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'assistant') {
                        lastMsg.content = fullResponse;
                    }
                    return newMessages;
                });
            }

            // Speak the final full response
            speakText(fullResponse);

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                setMessages(prev => {
                    // Remove the empty placeholder if we failed
                    const newMessages = [...prev];
                    if (newMessages[newMessages.length - 1].content === '') {
                        newMessages.pop();
                    }
                    return [...newMessages, { role: 'assistant', content: "Lo siento, tuve un problema al conectarme." }];
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    // Get the latest assistant message to display in bubble
    const latestAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || "Hola, soy Tomi.";

    // Choose what to display: subtitle (if speaking) or full text (static)
    // When speaking, strict mode: ONLY show subtitle (or empty if initializing). NEVER show full text during speech.
    const displayText = isSpeaking ? subtitle : cleanTextForSpeech(latestAssistantMessage);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-200/30 rounded-full blur-[80px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-green-200/30 rounded-full blur-[80px]" />
            </div>

            {/* Main Content: Avatar + Bubble */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

                {/* Robot Avatar Container */}
                <div className="relative w-full max-w-[600px] aspect-4/5 flex items-center justify-center">

                    {/* Speech Bubble Overlay */}
                    <AnimatePresence mode="wait">
                        {displayText && (
                            <motion.div
                                key={isSpeaking ? 'subtitle' : 'fulltext'}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] z-20"
                            >
                                <div className="bg-slate-600 backdrop-blur-md text-white p-6 rounded-3xl shadow-xl border border-white/10 relative min-h-[100px] flex items-center justify-center text-center">
                                    {/* Tail */}
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-600 backdrop-blur-md rotate-45 border-r border-b border-white/10"></div>

                                    <div className="text-xl md:text-2xl font-medium leading-relaxed max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {displayText}
                                        {isLoading && !isSpeaking && (
                                            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1 align-middle" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Robot Image */}
                    <div className="w-[80%] h-[80%] relative mt-20">
                        <ThinkingRobot state={isSpeaking ? 'speaking' : isLoading ? 'thinking' : isListening ? 'listening' : 'idle'} />
                    </div>
                </div>

            </div>

            {/* Bottom Controls: Input & Mic */}
            <div className="relative z-20 p-6 pb-8 bg-linear-to-t from-white via-white/80 to-transparent">
                <div className="max-w-xl mx-auto space-y-4">

                    {/* Floating Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => {
                                if (isSpeaking) {
                                    stopSpeaking();
                                } else {
                                    setIsMuted(!isMuted);
                                }
                            }}
                            className="bg-white hover:bg-slate-100 text-slate-700 p-3 rounded-full shadow-md border border-slate-200 transition-transform active:scale-95"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isSpeaking ? <StopCircle size={24} className="text-red-500" /> : (isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />)}
                        </button>
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSubmit} className="flex gap-2 relative bg-white p-2 rounded-[30px] shadow-lg border border-slate-100 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Haz tu consulta aquí..."
                            className="flex-1 bg-transparent border-none px-6 py-3 text-lg focus:ring-0 placeholder:text-slate-400 outline-none"
                        />

                        {/* Mic Button overlapping right */}
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`p-4 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-500 hover:bg-green-600'} text-white shadow-md`}
                        >
                            <Mic size={24} />
                        </button>

                        {/* Send Button (only show if input has text) */}
                        {input.trim() && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-all shadow-md active:scale-95"
                            >
                                <Send size={24} />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
