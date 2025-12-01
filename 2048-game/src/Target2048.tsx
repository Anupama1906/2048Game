// src/Target2048.tsx
// FIX #10 & #12: Optimized localStorage and lazy loading
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import { INITIAL_LEVELS } from './data/levels';
import { getDailyLevel } from './utils/daily';

// FIX #12: Lazy load non-critical screens
const LevelSelectView = lazy(() => import('./components/LevelSelectView'));
const CreatorView = lazy(() => import('./components/CreatorView'));
const GameView = lazy(() => import('./components/GameView'));

// Loading component
const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
);

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [bestScores, setBestScores] = useState<Record<string | number, number>>(() => {
        const saved = localStorage.getItem('target2048_scores');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return {}; }
        }
        return {};
    });

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // FIX #10: Optimize localStorage with useCallback
    useEffect(() => {
        localStorage.setItem('target2048_scores', JSON.stringify(bestScores));
    }, [bestScores]);

    const handleSelectLevel = useCallback((level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    }, []);

    const handlePlayDaily = useCallback(() => {
        const dailyLevel = getDailyLevel();
        setCurrentLevel(dailyLevel);
        setScreen('game');
    }, []);

    const handlePlayGenerated = useCallback((level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    }, []);

    // FIX #10: Use useCallback for score updates
    const handleLevelWon = useCallback((moves: number) => {
        if (currentLevel) {
            setBestScores(prev => {
                const currentBest = prev[currentLevel.id];
                if (currentBest === undefined || moves < currentBest) {
                    return { ...prev, [currentLevel.id]: moves };
                }
                return prev; // Return same reference if no update needed
            });
        }
    }, [currentLevel]);

    const handleNextLevel = useCallback(() => {
        if (currentLevel) {
            if (currentLevel.section === "Daily") {
                setScreen('menu');
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
    }, [currentLevel]);

    const handleBackToMenu = useCallback(() => {
        setScreen('menu');
        setCurrentLevel(null);
    }, []);

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-sans transition-colors duration-300">
                <div className="w-full h-screen overflow-hidden flex flex-col">
                    {screen === 'menu' && (
                        <MainMenuView
                            onPlay={() => setScreen('level-select')}
                            onDaily={handlePlayDaily}
                            onCreate={() => setScreen('creator')}
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                        />
                    )}

                    {/* FIX #12: Wrap lazy-loaded components in Suspense */}
                    <Suspense fallback={<LoadingScreen />}>
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
                                onBack={() => setScreen(currentLevel.section === "Daily" ? 'menu' : 'level-select')}
                                onLevelWon={handleLevelWon}
                                onComplete={handleNextLevel}
                            />
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}