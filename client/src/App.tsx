import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AIChat from './components/AIChat';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AIChat />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
