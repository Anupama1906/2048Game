// src/Target2048.tsx
import { useState, useEffect } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import LevelSelectView from './components/LevelSelectView';
import CreatorView from './components/CreatorView';
import GameView from './components/GameView';
import { INITIAL_LEVELS } from './data/levels';
import { getDailyLevel } from './utils/daily'; // Import the helper

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // ... (Keep existing bestScores state and effects) ...
    const [bestScores, setBestScores] = useState<Record<string | number, number>>(() => {
        const saved = localStorage.getItem('target2048_scores');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return {}; }
        }
        return {};
    });
    
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    useEffect(() => {
        localStorage.setItem('target2048_scores', JSON.stringify(bestScores));
    }, [bestScores]);


    const handleSelectLevel = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    // NEW: Handle Daily Play
    const handlePlayDaily = () => {
        const dailyLevel = getDailyLevel();
        setCurrentLevel(dailyLevel);
        setScreen('game');
    };

    const handlePlayGenerated = (level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    };

    const handleLevelComplete = (moves: number) => {
        if (currentLevel) {
            setBestScores(prev => {
                const currentBest = prev[currentLevel.id];
                if (currentBest === undefined || moves < currentBest) {
                    return { ...prev, [currentLevel.id]: moves };
                }
                return prev;
            });

            // If it was a Daily level, go back to menu instead of "Next Level"
            // (Since there is no "next" daily level for today)
            if (currentLevel.section === "Daily") {
                setScreen('menu'); // Or show a special "Daily Complete" screen in the future
            } else {
                const currentIndex = INITIAL_LEVELS.findIndex(l => l.id === currentLevel.id);
                if (currentIndex !== -1 && currentIndex < INITIAL_LEVELS.length - 1) {
                    setCurrentLevel(INITIAL_LEVELS[currentIndex + 1]);
                } else {
                    setScreen('level-select');
                }
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
                <div className="w-full h-screen overflow-hidden flex flex-col">
                    {screen === 'menu' && (
                        <MainMenuView
                            onPlay={() => setScreen('level-select')}
                            onDaily={handlePlayDaily} // Pass the handler
                            onCreate={() => setScreen('creator')}
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                        />
                    )}

                    {/* ... (Rest of the render logic remains the same) ... */}
                    {screen === 'level-select' && (
                        <LevelSelectView
                            onSelectLevel={handleSelectLevel}
                            onBack={handleBackToMenu}
                            bestScores={bestScores}
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
                            bestScore={bestScores[currentLevel.id]}
                            onBack={() => setScreen(currentLevel.section === "Daily" ? 'menu' : 'level-select')} // Smarter back button
                            onComplete={handleLevelComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}