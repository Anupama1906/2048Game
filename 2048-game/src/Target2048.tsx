// src/Target2048.tsx
import React, { useState, useEffect } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import LevelSelectView from './components/LevelSelectView';
import CreatorView from './components/CreatorView';
import GameView from './components/GameView';

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // FIXED: Load completed levels from localStorage
    const [completedLevels, setCompletedLevels] = useState<Set<string | number>>(() => {
        const saved = localStorage.getItem('target2048_progress');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // FIXED: Save progress whenever it changes
    useEffect(() => {
        localStorage.setItem('target2048_progress', JSON.stringify([...completedLevels]));
    }, [completedLevels]);

    const handleSelectLevel = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    const handlePlayGenerated = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    // FIXED: Mark level as complete and return to selection
    const handleLevelComplete = () => {
        if (currentLevel) {
            setCompletedLevels(prev => {
                const newSet = new Set(prev);
                newSet.add(currentLevel.id);
                return newSet;
            });
        }
        setScreen('level-select');
    };

    const handleBackToMenu = () => {
        setScreen('menu');
        setCurrentLevel(null);
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
                            onBack={handleBackToMenu} // Changed to back to menu
                            completedLevels={completedLevels} // Pass progress
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
                            onComplete={handleLevelComplete} // Pass the completion handler
                            isDarkMode={isDarkMode}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}