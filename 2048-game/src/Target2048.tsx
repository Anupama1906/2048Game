// src/Target2048.tsx
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { AppScreen, Level } from './types/types';
import MainMenuView from './components/MainMenuView';
import UsernameModal from './components/UsernameModal';
import DailyGameView from './components/DailyGameView';
import LoadingScreen from './components/LoadingScreen';
import { INITIAL_LEVELS } from './data/levels';
import { getDailyLevel } from './utils/daily';
import { useAuth } from './contexts/AuthContext';

const LevelSelectView = lazy(() => import('./components/LevelSelectView'));
const CreatorView = lazy(() => import('./components/CreatorView'));
const GameView = lazy(() => import('./components/GameView'));

export default function Target2048App() {
    const [screen, setScreen] = useState<AppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [showUsernameModal, setShowUsernameModal] = useState(false);

    // PERSISTED THEME STATE
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check local storage first
        const savedTheme = localStorage.getItem('target2048_theme');
        if (savedTheme !== null) {
            return JSON.parse(savedTheme);
        }
        // Fallback to system preference
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const { user, username, loading: authLoading, signIn } = useAuth();

    const [bestScores, setBestScores] = useState<Record<string | number, number>>(() => {
        const saved = localStorage.getItem('target2048_scores');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return {}; }
        }
        return {};
    });

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    // Save Theme to LocalStorage
    useEffect(() => {
        localStorage.setItem('target2048_theme', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('target2048_scores', JSON.stringify(bestScores));
    }, [bestScores]);

    const handleSelectLevel = useCallback((level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    }, []);

    const handlePlayDaily = useCallback(async () => {
        if (!user) {
            await signIn();
        }

        if (!username) {
            setShowUsernameModal(true);
            return;
        }

        const dailyLevel = getDailyLevel();
        setCurrentLevel(dailyLevel);
        setScreen('game');
    }, [user, username, signIn]);

    const handlePlayGenerated = useCallback((level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    }, []);

    const handleLevelWon = useCallback((moves: number) => {
        if (currentLevel) {
            setBestScores(prev => {
                const currentBest = prev[currentLevel.id];
                if (currentBest === undefined || moves < currentBest) {
                    return { ...prev, [currentLevel.id]: moves };
                }
                return prev;
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

    const handleUsernameSet = () => {
        setShowUsernameModal(false);
        handlePlayDaily();
    };

    if (authLoading) {
        return (
            <div className={isDarkMode ? 'dark' : ''}>
                <LoadingScreen />
            </div>
        );
    }

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
                            <>
                                {currentLevel.section === "Daily" ? (
                                    <DailyGameView
                                        level={currentLevel}
                                        onBack={handleBackToMenu}
                                    />
                                ) : (
                                    <GameView
                                        level={currentLevel}
                                        bestScore={bestScores[currentLevel.id]}
                                        onBack={() => setScreen('level-select')}
                                        onLevelWon={handleLevelWon}
                                        onComplete={handleNextLevel}
                                    />
                                )}
                            </>
                        )}
                    </Suspense>
                </div>
            </div>

            {showUsernameModal && (
                <UsernameModal onClose={handleUsernameSet} />
            )}
        </div>
    );
}