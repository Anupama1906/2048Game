// src/Target2048.tsx
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { AppScreen, Level } from './types/types';
import type { CustomLevel } from './types/editorTypes';
import MainMenuView from './components/MainMenuView';
import UsernameModal from './components/UsernameModal';
import DailyGameView from './components/DailyGameView';
import LoadingScreen from './components/LoadingScreen';
import MyLevelsView from './components/MyLevelsView';
import LevelEditorView from './components/LevelEditorView';
import CustomLevelTestView from './components/CustomLevelTestView';
import CommunityLevelsView, { type CommunityTab } from './components/CommunityLevelsView';
import { INITIAL_LEVELS } from './data/levels';
import { getDailyLevel } from './utils/daily';
import { useAuth } from './contexts/AuthContext';
import GameView from './components/GameView';
import DevPanel from './components/DevPanel';

const LevelSelectView = lazy(() => import('./components/LevelSelectView'));

type ExtendedAppScreen = AppScreen | 'my-levels' | 'level-editor' | 'test-level' | 'community-levels';

export default function Target2048App() {
    const [screen, setScreen] = useState<ExtendedAppScreen>('menu');
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [editingLevel, setEditingLevel] = useState<CustomLevel | null>(null);
    const [testingLevel, setTestingLevel] = useState<CustomLevel | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(false);

    const [communityTab, setCommunityTab] = useState<CommunityTab>('played');
    const [returnToScreen, setReturnToScreen] = useState<ExtendedAppScreen>('my-levels');

    const { user, username, loading: authLoading, ensureSignedIn } = useAuth();

    const [bestScores, setBestScores] = useState<Record<string | number, number>>(() => {
        const saved = localStorage.getItem('target2048_scores');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return {}; }
        }
        return {};
    });

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    useEffect(() => {
        localStorage.setItem('target2048_theme', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const handleSelectLevel = useCallback((level: Level) => {
        setCurrentLevel(level);
        setScreen('game');
    }, []);

    // ✅ NEW: Dev-friendly daily play with optional date override
    const handlePlayDaily = useCallback(async (dateOverride?: string) => {
        await ensureSignedIn();

        // If date is provided (from DevPanel), create a daily level for that date
        if (dateOverride && import.meta.env.DEV) {
            // Parse the date and create a daily level
            const date = new Date(dateOverride);
            const dailyLevel = getDailyLevel(); // This will be for "today" normally

            // Override the ID to match the selected date
            const customDailyLevel: Level = {
                ...dailyLevel,
                id: `daily-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                name: `Daily: ${dailyLevel.name} (${dateOverride})`
            };

            setCurrentLevel(customDailyLevel);
        } else {
            // Normal daily level
            const dailyLevel = getDailyLevel();
            setCurrentLevel(dailyLevel);
        }

        setScreen('game');
    }, [ensureSignedIn]);

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
                return;
            }
            if (currentLevel.section === 'Custom') {
                setScreen(returnToScreen);
                return;
            }
            const currentIndex = INITIAL_LEVELS.findIndex(l => l.id === currentLevel.id);
            if (currentIndex !== -1 && currentIndex < INITIAL_LEVELS.length - 1) {
                setCurrentLevel(INITIAL_LEVELS[currentIndex + 1]);
            } else {
                setScreen('level-select');
            }
        } else {
            setScreen('level-select');
        }
    }, [currentLevel, returnToScreen]);

    const handleBackToMenu = useCallback(() => {
        setScreen('menu');
        setCurrentLevel(null);
        setEditingLevel(null);
        setTestingLevel(null);
    }, []);

    const handleUsernameSet = () => {
        setShowUsernameModal(false);
    };

    const handleOpenMyLevels = useCallback(async () => {
        await ensureSignedIn();
        setScreen('my-levels');
    }, [ensureSignedIn]);

    const handleCreateNewLevel = () => {
        setEditingLevel(null);
        setScreen('level-editor');
    };

    const handleEditLevel = (level: CustomLevel) => {
        setEditingLevel(level);
        setScreen('level-editor');
    };

    const handlePlayCustomLevel = (level: CustomLevel) => {
        setTestingLevel(level);
        setScreen('test-level');
        setReturnToScreen('my-levels');
    };

    const handleBackToMyLevels = () => {
        setScreen('my-levels');
        setEditingLevel(null);
        setTestingLevel(null);
    };

    const handleBackFromTest = useCallback(() => {
        setScreen(returnToScreen);
        setTestingLevel(null);
        if (returnToScreen === 'my-levels') {
            setEditingLevel(null);
        }
    }, [returnToScreen]);

    const handleEditFromTest = () => {
        if (testingLevel) {
            setEditingLevel(testingLevel);
            setScreen('level-editor');
            setTestingLevel(null);
        }
    };

    const handleLevelVerified = () => {
        setScreen(returnToScreen);
        setTestingLevel(null);
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
                            onDaily={() => handlePlayDaily()}
                            onCreate={handleOpenMyLevels}
                            onCommunity={() => setScreen('community-levels')}
                            isDarkMode={isDarkMode}
                            toggleDarkMode={toggleDarkMode}
                        />
                    )}

                    {screen === 'community-levels' && (
                        <CommunityLevelsView
                            onBack={handleBackToMenu}
                            onPlay={(level) => {
                                setTestingLevel(level);
                                setScreen('test-level');
                                setReturnToScreen('community-levels');
                            }}
                            activeTab={communityTab}
                            onTabChange={setCommunityTab}
                        />
                    )}

                    {screen === 'my-levels' && (
                        <MyLevelsView
                            onBack={handleBackToMenu}
                            onCreateNew={handleCreateNewLevel}
                            onEdit={handleEditLevel}
                            onPlay={handlePlayCustomLevel}
                        />
                    )}

                    {screen === 'level-editor' && (
                        <LevelEditorView
                            existingLevel={editingLevel}
                            onBack={handleBackToMyLevels}
                            onPlayTest={handlePlayCustomLevel}
                        />
                    )}

                    {screen === 'test-level' && testingLevel && (
                        <CustomLevelTestView
                            level={testingLevel}
                            onBack={handleBackFromTest}
                            onEdit={handleEditFromTest}
                            onVerified={handleLevelVerified}
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

                {/* ✅ NEW: Dev Panel (only shows in development) */}
                {import.meta.env.DEV && (
                    <DevPanel
                        onJumpToLevel={handleSelectLevel}
                        onPlayDaily={handlePlayDaily}
                        currentLevel={currentLevel || testingLevel}
                        onVerifyLevel={() => {
                            // Trigger a re-render by updating the testingLevel
                            if (testingLevel) {
                                setTestingLevel({ ...testingLevel });
                            }
                        }}
                    />
                )}
            </div>

            {showUsernameModal && (
                <UsernameModal onClose={handleUsernameSet} />
            )}
        </div>
    );
}