import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import type { AppScreen, Level } from './types/types';
import type { CustomLevel } from './types/editorTypes';
import { Calendar, AlertTriangle } from 'lucide-react';
import MainMenuView from './components/MainMenuView';
import UsernameModal from './components/UsernameModal';
import DailyGameView from './components/DailyGameView';
import LoadingScreen from './components/LoadingScreen';
import MyLevelsView from './components/MyLevelsView';
import LevelEditorView from './components/LevelEditor/LevelEditorView';
import CustomLevelTestView from './components/CustomLevelTestView';
import CommunityLevelsView from './components/CommunityLevelsView';
import { Modal } from './components/shared/Modal';
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

    // Dev State
    const [devPanelOpen, setDevPanelOpen] = useState(false);
    const [isDevDailyMode, setIsDevDailyMode] = useState(false);

    // Modal States
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [showNoDailyModal, setShowNoDailyModal] = useState(false);
    const [noDailyDate, setNoDailyDate] = useState('');

    const [returnToScreen, setReturnToScreen] = useState<ExtendedAppScreen>('my-levels');

    const { user, username, loading: authLoading, ensureSignedIn } = useAuth();
    const pendingAction = useRef<(() => void) | null>(null);

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
        requireUsername(async () => {
            try {
                const dateKey = dateOverride || getDateKey();
                const dailyLevel = await fetchDailyPuzzle(dateKey);

                if (!dailyLevel) {
                    setNoDailyDate(dateKey);
                    setShowNoDailyModal(true);
                    return;
                }

                setCurrentLevel(dailyLevel);
                setScreen('game');
            } catch (error) {
                console.error('Failed to load daily puzzle:', error);
                alert('Failed to load daily puzzle. Please try again.');
            }
        });
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
        setIsDevDailyMode(false); // Reset dev mode
    }, []);

    // Username Handlers
    const handleUsernameSuccess = () => {
        setShowUsernameModal(false);
        if (pendingAction.current) {
            pendingAction.current();
            pendingAction.current = null;
        }
    };

    const handleUsernameClose = () => {
        setShowUsernameModal(false);
        pendingAction.current = null;
    };

    const handleOpenMyLevels = useCallback(async () => {
        requireUsername(() => setScreen('my-levels'));
    }, [requireUsername]);

    const handleCreateNewLevel = () => {
        setIsDevDailyMode(false);
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

    // --- Dev Daily Flow ---
    const handleDevCreateDaily = () => {
        setIsDevDailyMode(true);
        setEditingLevel(null);
        setScreen('level-editor');
        setDevPanelOpen(false); // Close panel to focus on editor
    };

    const handleDevPublish = (level: CustomLevel) => {
        // We have the verified level.
        // We want to open the DevPanel and prep it for publishing.
        // For simplicity, we just switch back to menu (or stay overlaid) and open panel.
        setTestingLevel(level); // Keep it referenced so DevPanel can see it via 'currentLevel' prop logic below
        setScreen('menu'); // Or stay? Let's go menu.
        setDevPanelOpen(true);
    };


    const handlePlayCustomLevel = (level: CustomLevel) => {
        setTestingLevel(level);
        setScreen('test-level');
        setReturnToScreen(isDevDailyMode ? 'level-editor' : 'my-levels'); // Correct return path
    };

    const handleBackToMyLevels = () => {
        if (isDevDailyMode) {
            setScreen('menu');
            setIsDevDailyMode(false);
            setDevPanelOpen(true);
        } else {
            setScreen('my-levels');
            setEditingLevel(null);
            setTestingLevel(null);
        }
    };

    const handleBackFromTest = useCallback(() => {
        if (isDevDailyMode) {
            setScreen('level-editor');
            setEditingLevel(testingLevel); // Re-edit same level
            setTestingLevel(null);
        } else {
            setScreen(returnToScreen);
            setTestingLevel(null);
            if (returnToScreen === 'my-levels') {
                setEditingLevel(null);
            }
        }
    }, [returnToScreen, isDevDailyMode, testingLevel]);

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
                            saveMode={isDevDailyMode ? 'daily-dev' : (editingLevel?.section === 'Daily' ? 'export' : 'local')}
                        />
                    )}

                    {screen === 'test-level' && testingLevel && (
                        <CustomLevelTestView
                            level={testingLevel}
                            onBack={handleBackFromTest}
                            onEdit={handleEditFromTest}
                            onVerified={handleLevelVerified}
                            isDevDaily={isDevDailyMode}
                            onPublish={handleDevPublish}
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
                        isOpen={devPanelOpen}
                        onToggle={setDevPanelOpen}
                        onJumpToLevel={handleSelectLevel}
                        onPlayDaily={handlePlayDaily}
                        onEditLevel={handleDevEditLevel}
                        currentLevel={currentLevel || testingLevel}
                        onCreateDaily={handleDevCreateDaily}
                        onVerifyLevel={() => {
                            if (testingLevel) {
                                setTestingLevel({ ...testingLevel });
                            }
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            {showUsernameModal && (
                <UsernameModal
                    onClose={handleUsernameClose}
                    onSuccess={handleUsernameSuccess}
                />
            )}

            <Modal
                isOpen={showNoDailyModal}
                onClose={() => setShowNoDailyModal(false)}
                title="No Puzzle Found"
                icon={Calendar}
                iconColor="text-orange-500"
                maxWidth="sm"
            >
                <div className="p-6 text-center">
                    <AlertTriangle size={48} className="mx-auto text-orange-400 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                        No puzzle available for {noDailyDate}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Please check back tomorrow for a new challenge!
                    </p>
                    <button
                        onClick={() => setShowNoDailyModal(false)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold transition"
                    >
                        Continue
                    </button>
                </div>
            </Modal>
        </div>
    );
}
