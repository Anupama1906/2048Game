// src/Target2048.tsx
import { useState, useEffect } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import LevelSelectView from './components/LevelSelectView';
import CreatorView from './components/CreatorView';
import GameView from './components/GameView';
import { INITIAL_LEVELS } from './data/levels'; // Imported levels list

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load completed levels from localStorage
    const [completedLevels, setCompletedLevels] = useState<Set<string | number>>(() => {
        const saved = localStorage.getItem('target2048_progress');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // Save progress whenever it changes
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

    // FIXED: Advance to the next level if available
    const handleLevelComplete = () => {
        if (currentLevel) {
            // 1. Save Progress
            setCompletedLevels(prev => {
                const newSet = new Set(prev);
                newSet.add(currentLevel.id);
                return newSet;
            });

            // 2. Find Next Level
            const currentIndex = INITIAL_LEVELS.findIndex(l => l.id === currentLevel.id);

            // If we found the current level and it's NOT the last one, go to next
            if (currentIndex !== -1 && currentIndex < INITIAL_LEVELS.length - 1) {
                const nextLevel = INITIAL_LEVELS[currentIndex + 1];
                setCurrentLevel(nextLevel);
                // Screen remains 'game', so the component re-renders with the new level
            } else {
                // If it's the last level (or a custom generated one), go back to menu
                setScreen('level-select');
            }
        } else {
            setScreen('level-select');
        }
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
                            onBack={handleBackToMenu}
                            completedLevels={completedLevels}
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
                            onComplete={handleLevelComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}