import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Landing from './components/Landing';
import Tutorials from './components/Tutorials';
import AppsHub from './components/AppsHub';
import Community from './components/Community';
import AIChat from './components/AIChat';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main Layout Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/tutorials" element={<Tutorials />} />
                    <Route path="/apps" element={<AppsHub />} />
                    <Route path="/community" element={<Community />} />
                </Route>

                {/* Standalone Immersive Chat */}
                <Route path="/ai-chat" element={<AIChat />} />

                {/* Redirect unknowns to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
