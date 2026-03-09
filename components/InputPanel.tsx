import React, { useState } from 'react';
import { UserRequirements, Language, SavedRecipe } from '../types';
import { TRANSLATIONS } from '../constants';
import { analyzeMarketRequirements } from '../services/geminiService';
import { Sliders, Thermometer, Shield, Weight, DollarSign, Hammer, Beaker, Shuffle, Globe, Book, Trash2, Edit3, Play, Square, SortAsc, LayoutList, LayoutGrid, Search, Sparkles } from 'lucide-react';

interface InputPanelProps {
  requirements: UserRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<UserRequirements>>;
  onGenerate: () => void;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  savedRecipes: SavedRecipe[];
  onDeleteRecipe: (id: string) => void;
  onLoadRecipe: (recipe: SavedRecipe) => void;
  // Batch props
  onBatchGenerate: (count: number) => void;
  isBatchProcessing: boolean;
  batchProgress: { current: number; total: number };
  onStopBatch: () => void;
  // Overlay props
  setProcessingOverlay: (visible: boolean, type?: 'generation' | 'market' | 'deepApp') => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ 
  requirements, setRequirements, onGenerate, isLoading, language, setLanguage,
  savedRecipes, onDeleteRecipe, onLoadRecipe,
  onBatchGenerate, isBatchProcessing, batchProgress, onStopBatch,
  setProcessingOverlay
}) => {
  const [activeTab, setActiveTab] = useState<'market' | 'generator' | 'library'>('market');
  const [batchCount, setBatchCount] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'dateNew' | 'dateOld' | 'name'>('dateNew');
  const [viewMode, setViewMode] = useState<'compact' | 'detail'>('compact');
  
  // Market Analysis State
  const [marketInput, setMarketInput] = useState('');
  
  const t = TRANSLATIONS[language];

  const handleChange = (key: keyof UserRequirements, value: any) => {
    setRequirements(prev => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    setRequirements({
      targetHardness: Math.floor(Math.random() * 100),
      targetFlexibility: Math.floor(Math.random() * 100),
      targetCorrosionResistance: Math.floor(Math.random() * 100),
      targetHeatResistance: Math.floor(Math.random() * 100),
      targetWeight: Math.floor(Math.random() * 100),
      costConstraint: ['Budget', 'Standard', 'Premium'][Math.floor(Math.random() * 3)] as any,
      applicationContext: requirements.applicationContext
    });
  };

  const handleMarketAnalysis = async () => {
    if (!marketInput.trim()) return;
    setProcessingOverlay(true, 'market');
    try {
      const newReqs = await analyzeMarketRequirements(marketInput, language);
      setRequirements(newReqs);
      setActiveTab('generator'); // Switch to generator tab to show results
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setProcessingOverlay(false);
    }
  };

  const handleBatchCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 1;
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    setBatchCount(val);
  };

  const getSortedRecipes = () => {
    const sorted = [...savedRecipes];
    switch (sortBy) {
      case 'dateNew': return sorted.sort((a, b) => b.timestamp - a.timestamp);
      case 'dateOld': return sorted.sort((a, b) => a.timestamp - b.timestamp);
      case 'name': return sorted.sort((a, b) => a.alloyName.localeCompare(b.alloyName));
      default: return sorted;
    }
  };

  const sliders = [
    { label: t.sliders.hardness, icon: <Hammer className="w-4 h-4" />, key: 'targetHardness' as keyof UserRequirements },
    { label: t.sliders.flexibility, icon: <Beaker className="w-4 h-4" />, key: 'targetFlexibility' as keyof UserRequirements },
    { label: t.sliders.corrosion, icon: <Shield className="w-4 h-4" />, key: 'targetCorrosionResistance' as keyof UserRequirements },
    { label: t.sliders.heat, icon: <Thermometer className="w-4 h-4" />, key: 'targetHeatResistance' as keyof UserRequirements },
    { label: t.sliders.weight, icon: <Weight className="w-4 h-4" />, key: 'targetWeight' as keyof UserRequirements },
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex bg-slate-700 rounded-lg p-1 w-full max-w-sm">
           <button 
            onClick={() => setActiveTab('market')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {t.tabs.market}
          </button>
          <button 
            onClick={() => setActiveTab('generator')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'generator' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {t.tabs.generator}
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'library' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            {t.tabs.library}
          </button>
        </div>
        
        <div className="flex gap-2 ml-2">
           <button 
             onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
             className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
             title="Switch Language"
           >
             <Globe className="w-4 h-4" />
           </button>
        </div>
      </div>

      {activeTab === 'market' && (
        <div className="flex-grow flex flex-col">
           <div className="mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                {t.market.title}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{t.market.desc}</p>
           </div>
           
           <textarea
             value={marketInput}
             onChange={(e) => setMarketInput(e.target.value)}
             placeholder={t.market.placeholder}
             className="w-full h-48 bg-slate-700 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-6"
           />
           
           <button
             onClick={handleMarketAnalysis}
             disabled={isLoading || isBatchProcessing || !marketInput.trim()}
             className={`w-full py-4 px-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
               isLoading || isBatchProcessing || !marketInput.trim()
                 ? 'bg-slate-600 cursor-not-allowed'
                 : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
             }`}
           >
              <Sparkles className="w-5 h-5" />
              {t.market.analyzeBtn}
           </button>
        </div>
      )}

      {activeTab === 'generator' && (
        <>
          <div className="flex justify-between items-end mb-4">
             <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  {t.params}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{t.paramsDesc}</p>
             </div>
          </div>

          <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {/* Batch Controls */}
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                   <span className="text-xs text-slate-400">{t.batch.label}:</span>
                   <input 
                      type="number" 
                      min="1" 
                      max="999" 
                      value={batchCount}
                      onChange={handleBatchCountChange}
                      disabled={isBatchProcessing}
                      className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                   />
                </div>
                {isBatchProcessing ? (
                   <button 
                     onClick={onStopBatch}
                     className="flex items-center gap-1 bg-rose-500/20 text-rose-300 px-3 py-1 rounded hover:bg-rose-500 hover:text-white transition-all text-xs font-bold border border-rose-500/30"
                   >
                     <Square className="w-3 h-3 fill-current" /> {t.batch.stop}
                   </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRandomize} 
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                      title={t.randomize}
                    >
                      <Shuffle className="w-3 h-3" />
                    </button>
                    {batchCount > 1 && (
                      <button 
                        onClick={() => onBatchGenerate(batchCount)}
                        className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold border border-indigo-500/30"
                      >
                        <Play className="w-3 h-3 fill-current" /> {t.batch.start}
                      </button>
                    )}
                  </div>
                )}
            </div>

            {isBatchProcessing && (
              <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg">
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-indigo-300 font-bold">{t.batch.autoSave}</span>
                   <span className="text-slate-400">{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                 </div>
                 <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                   ></div>
                 </div>
                 <p className="text-xs text-center mt-2 text-slate-400">
                   {t.batch.progress.replace('{current}', batchProgress.current.toString()).replace('{total}', batchProgress.total.toString())}
                 </p>
              </div>
            )}

            {/* Sliders */}
            {sliders.map((slider) => (
              <div key={slider.key} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-300">
                  <span className="flex items-center gap-2">{slider.icon} {slider.label}</span>
                  <span className="text-indigo-400">{requirements[slider.key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={requirements[slider.key] as number}
                  onChange={(e) => handleChange(slider.key, parseInt(e.target.value))}
                  disabled={isBatchProcessing}
                  className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all ${isBatchProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            ))}

            {/* Cost Constraint */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <DollarSign className="w-4 h-4" /> {t.cost}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Budget', 'Standard', 'Premium'].map((option) => (
                  <button
                    key={option}
                    disabled={isBatchProcessing}
                    onClick={() => handleChange('costConstraint', option)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                      requirements.costConstraint === option
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    } ${isBatchProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {language === 'zh' && option === 'Budget' ? '预算型' : 
                     language === 'zh' && option === 'Standard' ? '标准型' : 
                     language === 'zh' && option === 'Premium' ? '高端型' : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">{t.context}</label>
              <textarea
                value={requirements.applicationContext}
                onChange={(e) => handleChange('applicationContext', e.target.value)}
                placeholder={t.contextPlaceholder}
                disabled={isBatchProcessing}
                className={`w-full h-24 bg-slate-700 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none ${isBatchProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={onGenerate}
              disabled={isLoading || isBatchProcessing}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isLoading || isBatchProcessing
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.synthesizing}
                </>
              ) : (
                <>
                  <Beaker className="w-5 h-5" />
                  {t.generateBtn}
                </>
              )}
            </button>
          </div>
        </>
      )} 
      
      {activeTab === 'library' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          <div className="mb-4 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Book className="w-5 h-5 text-indigo-400" />
                  {t.tabs.library}
             </h2>
             <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{savedRecipes.length}</span>
          </div>
          
          {/* Library Controls */}
          <div className="mb-4 flex gap-2">
             <div className="relative flex-grow">
               <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded pl-8 pr-2 py-1.5 appearance-none focus:ring-1 focus:ring-indigo-500 outline-none"
               >
                 <option value="dateNew">{t.library.sortDateNew}</option>
                 <option value="dateOld">{t.library.sortDateOld}</option>
                 <option value="name">{t.library.sortName}</option>
               </select>
               <SortAsc className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
             </div>
             <div className="flex bg-slate-700 rounded border border-slate-600 p-0.5">
               <button 
                 onClick={() => setViewMode('compact')}
                 className={`p-1 rounded ${viewMode === 'compact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 title={t.library.viewCompact}
               >
                 <LayoutList className="w-3 h-3" />
               </button>
               <button 
                 onClick={() => setViewMode('detail')}
                 className={`p-1 rounded ${viewMode === 'detail' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                 title={t.library.viewDetail}
               >
                 <LayoutGrid className="w-3 h-3" />
               </button>
             </div>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {savedRecipes.length === 0 ? (
              <div className="text-center text-slate-500 py-10 italic">
                {t.emptyLibrary}
              </div>
            ) : (
              getSortedRecipes().map(recipe => (
                <div key={recipe.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm truncate pr-2 flex items-center gap-1">
                      {recipe.alloyName}
                      {recipe.codeName && (
                        <span className="text-rose-500 font-bold italic text-xs tracking-wider">
                           “{recipe.codeName}”
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(recipe.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {viewMode === 'detail' && (
                    <div className="mb-3">
                       <p className="text-xs text-slate-400 line-clamp-2 mb-2">{recipe.description}</p>
                       <div className="flex gap-1 flex-wrap">
                          {recipe.composition.slice(0, 3).map((c, i) => (
                             <span key={i} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-600">
                                {c.element} {c.percentage}%
                             </span>
                          ))}
                          {recipe.composition.length > 3 && <span className="text-[10px] text-slate-500">...</span>}
                       </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => {
                        onLoadRecipe(recipe);
                        setActiveTab('generator');
                      }}
                      className="flex-1 py-1.5 bg-indigo-600/20 text-indigo-300 text-xs rounded hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> {t.load}
                    </button>
                    <button 
                      onClick={() => onDeleteRecipe(recipe.id)}
                      className="w-8 py-1.5 bg-rose-600/20 text-rose-300 text-xs rounded hover:bg-rose-600 hover:text-white transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPanel;