// src/Target2048.tsx
import { useState, useEffect } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import LevelSelectView from './components/LevelSelectView';
import CreatorView from './components/CreatorView';
import GameView from './components/GameView';
import { INITIAL_LEVELS } from './data/levels';

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Store Best Scores: Record<LevelID, BestMoves>
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

            const currentIndex = INITIAL_LEVELS.findIndex(l => l.id === currentLevel.id);
            if (currentIndex !== -1 && currentIndex < INITIAL_LEVELS.length - 1) {
                setCurrentLevel(INITIAL_LEVELS[currentIndex + 1]);
            } else {
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
                <div className="w-full h-screen overflow-hidden flex flex-col">
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
                            bestScore={bestScores[currentLevel.id]} // Pass best score here
                            onBack={() => setScreen('level-select')}
                            onComplete={handleLevelComplete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
