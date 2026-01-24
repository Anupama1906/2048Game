// src/Target2048.tsx
import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import type { AppScreen, Level } from './types/types';
import type { CustomLevel } from './types/editorTypes';
import MainMenuView from './components/MainMenuView';
import UsernameModal from './components/UsernameModal';
import DailyGameView from './components/DailyGameView';
import LoadingScreen from './components/LoadingScreen';
import MyLevelsView from './components/MyLevelsView';
import LevelEditorView from './components/LevelEditor/LevelEditorView';
import CustomLevelTestView from './components/CustomLevelTestView';
import CommunityLevelsView, { type CommunityTab } from './components/CommunityLevelsView';
import { INITIAL_LEVELS } from './data/levels';
import { fetchDailyPuzzle, getDateKey } from './services/dailyPuzzleService';
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
    const [dailyError, setDailyError] = useState(false);

    const [communityTab, setCommunityTab] = useState<CommunityTab>('played');
    const [returnToScreen, setReturnToScreen] = useState<ExtendedAppScreen>('my-levels');

    const { user, username, loading: authLoading, ensureSignedIn } = useAuth();
    const pendingAction = useRef<(() => void) | null>(null);

    // Helper to check username requirement
    const requireUsername = async (action: () => void) => {
        await ensureSignedIn();
        if (!username) {
            pendingAction.current = action;
            setShowUsernameModal(true);
        } else {
            action();
        }
    };

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

    const handlePlayDaily = useCallback(async (dateOverride?: string) => {
        await ensureSignedIn();
        setDailyError(false);

        try {
            const dateKey = dateOverride || getDateKey();
            const dailyLevel = await fetchDailyPuzzle(dateKey);

            if (!dailyLevel) {
                setDailyError(true);
                alert(`⚠️ No puzzle available for ${dateKey}.\n\nPlease check back Tomorrow!`);
                return;
            }

            setCurrentLevel(dailyLevel);
            setScreen('game');
        } catch (error) {
            console.error('Failed to load daily puzzle:', error);
            setDailyError(true);
            alert('Failed to load daily puzzle. Please try again.');
        }
    }, [ensureSignedIn, username]);

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
        if (pendingAction.current) {
            pendingAction.current();
            pendingAction.current = null;
        }
    };

    const handleOpenMyLevels = useCallback(async () => {
        await ensureSignedIn();
        setScreen('my-levels');
    }, [ensureSignedIn, username]);

    const handleCreateNewLevel = () => {
        setEditingLevel(null);
        setScreen('level-editor');
    };
    const handleOpenCommunity = useCallback(async () => {
        requireUsername(() => setScreen('community-levels'));
    }, [ensureSignedIn, username]);

    const handleEditLevel = (level: CustomLevel) => {
        setEditingLevel(level);
        setScreen('level-editor');
    };

    const handleDevEditLevel = (level: Level) => {
        const editableLevel: CustomLevel = {
            ...level,
            id: level.id,
            createdBy: 'dev',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isVerified: true,
            section: 'Daily'
        };
        setEditingLevel(editableLevel);
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
                            onCommunity={handleOpenCommunity}
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
                            saveMode={editingLevel?.section === 'Daily' ? 'export' : 'local'}
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

                {import.meta.env.DEV && (
                    <DevPanel
                        onJumpToLevel={handleSelectLevel}
                        onPlayDaily={handlePlayDaily}
                        onEditLevel={handleDevEditLevel}
                        currentLevel={currentLevel || testingLevel}
                        onVerifyLevel={() => {
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