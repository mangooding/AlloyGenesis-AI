import React, { useState, useEffect, useRef } from 'react';
import InputPanel from './components/InputPanel';
import ResultDashboard from './components/ResultDashboard';
import ProcessingOverlay from './components/ProcessingOverlay';
import AuthModal from './components/AuthModal';
import RecipeHistory from './components/RecipeHistory';
import { UserRequirements, AlloyResult, Language, SavedRecipe } from './types';
import { INITIAL_REQUIREMENTS, TRANSLATIONS } from './constants';
import { generateAlloyComposition } from './services/geminiService';
import { useAuth } from './lib/AuthContext';
import { Beaker, LogOut, LogIn, History } from 'lucide-react';

const App: React.FC = () => {
  const [requirements, setRequirements] = useState<UserRequirements>(INITIAL_REQUIREMENTS);
  const [result, setResult] = useState<AlloyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State - Default language set to 'zh' (Chinese)
  const [language, setLanguage] = useState<Language>('zh');
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  // Processing Overlay State
  const [processingState, setProcessingState] = useState<{
    isVisible: boolean;
    steps: string[];
    title: string;
  }>({ isVisible: false, steps: [], title: '' });

  const [isLoading, setIsLoading] = useState(false);

  // Batch Processing State
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const stopBatchRef = useRef(false);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showRecipeHistory, setShowRecipeHistory] = useState(false);

  const { user, signOut } = useAuth();

  // Load from local storage on mount
  useEffect(() => {
    const storedRecipes = localStorage.getItem('alloy_recipes');
    if (storedRecipes) {
      try {
        setSavedRecipes(JSON.parse(storedRecipes));
      } catch (e) {
        console.error("Failed to parse saved recipes", e);
      }
    }
  }, []);

  // Save to local storage whenever recipes change
  useEffect(() => {
    localStorage.setItem('alloy_recipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const setProcessingOverlay = (visible: boolean, type?: 'generation' | 'market' | 'deepApp') => {
    if (!visible) {
      setProcessingState(prev => ({ ...prev, isVisible: false }));
      return;
    }

    if (type) {
      const t = TRANSLATIONS[language];
      setProcessingState({
        isVisible: true,
        steps: t.steps[type],
        title: t.steps.titles[type === 'generation' ? 'gen' : type === 'market' ? 'market' : 'deep']
      });
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setProcessingOverlay(true, 'generation');
    setError(null);
    try {
      const data = await generateAlloyComposition(requirements, language);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate alloy composition. Please try again later or check your API configuration.");
    } finally {
      setIsLoading(false);
      setProcessingOverlay(false);
    }
  };

  const handleSaveRecipe = async (resultToSave: AlloyResult, specificReqs?: UserRequirements) => {
    const newRecipe: SavedRecipe = {
      ...resultToSave,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      originalRequirements: specificReqs ? { ...specificReqs } : { ...requirements }
    };

    // Save to local storage
    setSavedRecipes(prev => [newRecipe, ...prev]);

    // If user is logged in, also save to cloud
    if (user) {
      try {
        const response = await fetch('/api/recipes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.id}`,
          },
          body: JSON.stringify({
            alloyName: resultToSave.alloyName,
            codeName: resultToSave.codeName,
            description: resultToSave.description,
            composition: resultToSave.composition,
            properties: resultToSave.properties,
            feasibility: resultToSave.feasibility,
            manufacturing: resultToSave.manufacturing,
            costAnalysis: resultToSave.costAnalysis,
            applications: resultToSave.applications,
            deepApplications: resultToSave.deepApplications,
            similarAlloys: resultToSave.similarAlloys,
            originalRequirements: newRecipe.originalRequirements,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save recipe to cloud');
        }
      } catch (err) {
        console.error('Error saving recipe to cloud:', err);
      }
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setRequirements(recipe.originalRequirements);
    setResult(recipe);
  };

  const generateRandomRequirements = (): UserRequirements => {
    return {
      targetHardness: Math.floor(Math.random() * 100),
      targetFlexibility: Math.floor(Math.random() * 100),
      targetCorrosionResistance: Math.floor(Math.random() * 100),
      targetHeatResistance: Math.floor(Math.random() * 100),
      targetWeight: Math.floor(Math.random() * 100),
      costConstraint: ['Budget', 'Standard', 'Premium'][Math.floor(Math.random() * 3)] as any,
      applicationContext: requirements.applicationContext
    };
  };

  const handleBatchGenerate = async (count: number) => {
    if (count < 1) return;
    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: count });
    stopBatchRef.current = false;
    setError(null);

    for (let i = 0; i < count; i++) {
      if (stopBatchRef.current) break;
      
      const randomReqs = generateRandomRequirements();
      
      try {
        const data = await generateAlloyComposition(randomReqs, language);
        handleSaveRecipe(data, randomReqs);
        setResult(data);
      } catch (err) {
        console.error(`Batch generation failed at index ${i}`, err);
      }

      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    setIsBatchProcessing(false);
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowRecipeHistory(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <ProcessingOverlay 
        isVisible={processingState.isVisible} 
        steps={processingState.steps} 
        title={processingState.title}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      {/* Navbar */}
      <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <Beaker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {TRANSLATIONS[language].appTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider">{TRANSLATIONS[language].subtitle}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden md:block">v1.5.0</span>
          
          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRecipeHistory(!showRecipeHistory)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                title={language === 'zh' ? '配方历史' : 'Recipe History'}
              >
                <History className="w-4 h-4" />
                <span className="hidden md:inline">{language === 'zh' ? '历史' : 'History'}</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600/20 rounded-lg">
                <span className="text-indigo-300">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{language === 'zh' ? '退出' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">{language === 'zh' ? '登录' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-[calc(100vh-7rem)] grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Panel: Inputs & Library */}
          <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
            {showRecipeHistory ? (
              <div className="bg-slate-800/50 rounded-xl p-4 h-full overflow-y-auto">
                <h3 className="text-lg font-bold mb-4 text-white">
                  {language === 'zh' ? '配方历史' : 'Recipe History'}
                </h3>
                <RecipeHistory 
                  language={language}
                  onLoadRecipe={(recipe) => {
                    handleLoadRecipe(recipe);
                    setShowRecipeHistory(false);
                  }}
                />
              </div>
            ) : (
              <InputPanel 
                requirements={requirements}
                setRequirements={setRequirements}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                language={language}
                setLanguage={setLanguage}
                savedRecipes={savedRecipes}
                onDeleteRecipe={handleDeleteRecipe}
                onLoadRecipe={handleLoadRecipe}
                onBatchGenerate={handleBatchGenerate}
                isBatchProcessing={isBatchProcessing}
                batchProgress={batchProgress}
                onStopBatch={handleStopBatch}
                setProcessingOverlay={setProcessingOverlay}
              />
            )}
          </div>

          {/* Right Panel: Dashboard */}
          <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden bg-slate-900/50 rounded-xl relative">
            {error && (
              <div className="absolute top-4 left-4 right-4 z-20 bg-rose-500/10 border border-rose-500/50 text-rose-200 p-4 rounded-lg flex items-center gap-2">
                 <span className="font-bold">Error:</span> {error}
              </div>
            )}
            <ResultDashboard 
              result={result} 
              onSave={(res) => handleSaveRecipe(res)}
              language={language}
              setProcessingOverlay={setProcessingOverlay}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
