// Target2048.tsx
import React, { useState } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import LevelSelectView from './components/LevelSelectView';
import CreatorView from './components/CreatorView';
import GameView from './components/GameView';

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleSelectLevel = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    const handlePlayGenerated = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    const handleBackToMenu = () => {
        setScreen('menu');
        setCurrentLevel(null);
    };

    const handleLevelSelectBack = () => {
        setScreen('menu');
    };

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-300">
                <div className="container mx-auto px-4 py-8 h-screen max-h-[900px] overflow-hidden flex flex-col">
                    {screen === 'menu' && (
                        <MainMenuView
                            onPlay={() => setScreen('level-select')}
                            onCreate={() => setScreen('creator')}
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                        />
                    )}

                    {screen === 'level-select' && (
                        <LevelSelectView
                            onSelectLevel={handleSelectLevel}
                            onBack={handleLevelSelectBack}
                        />
                    )}

                    {screen === 'creator' && (
                        <CreatorView
                            onBack={handleBackToMenu}
                            onPlayGenerated={handlePlayGenerated}
                        />
                    )}

                    {screen === 'game' && currentLevel && (
                        <GameView
                            level={currentLevel}
                            onBack={() => setScreen('level-select')}
                            onComplete={() => setScreen('level-select')}
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}