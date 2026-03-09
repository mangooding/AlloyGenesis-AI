import React, { useState } from 'react';
import { AlloyResult, Language, DeepApplication } from '../types';
import { TRANSLATIONS } from '../constants';
import CompositionChart from './CompositionChart';
import PropertyRadar from './PropertyRadar';
import { generateDeepApplications } from '../services/geminiService';
import { AlertTriangle, CheckCircle, Factory, Tag, TrendingUp, Info, Leaf, Wrench, Save, BookOpen, Settings, ChevronDown, Briefcase, Search, Loader2 } from 'lucide-react';

interface ResultDashboardProps {
  result: AlloyResult | null;
  onSave: (result: AlloyResult) => void;
  language: Language;
  setProcessingOverlay: (visible: boolean, type?: 'generation' | 'market' | 'deepApp') => void;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onSave, language, setProcessingOverlay }) => {
  const [deepApps, setDeepApps] = useState<DeepApplication[] | null>(null);
  const t = TRANSLATIONS[language];

  // Reset local state when result changes
  React.useEffect(() => {
    setDeepApps(null);
  }, [result?.alloyName]);

  const handleDeepAnalysis = async () => {
    if (!result) return;
    setProcessingOverlay(true, 'deepApp');
    try {
      const data = await generateDeepApplications(result, language);
      setDeepApps(data);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingOverlay(false);
    }
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
        <Factory className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">{t.ready}</h3>
        <p className="max-w-md">{t.readyDesc}</p>
      </div>
    );
  }

  // Safe accessors for backward compatibility
  const materialBreakdown = result.costAnalysis.materialCostBreakdown || [];
  const processBreakdown = result.costAnalysis.manufacturingCostBreakdown || [];
  const bulkPricing = result.costAnalysis.bulkPricing || { minOrderQuantity: 'N/A', estimatedPriceRange: 'N/A' };
  const manufacturing = result.manufacturing || { method: 'Standard Synthesis', steps: [], specificEquipment: [] };

  return (
    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
      
      {/* Header Info */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Factory className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded font-mono uppercase">Generated Alloy</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-baseline flex-wrap gap-2">
                {result.alloyName} 
                {result.codeName && (
                  <span className="text-rose-500 font-black tracking-wider italic font-mono text-2xl">
                    “{result.codeName}”
                  </span>
                )}
              </h1>
              <p className="text-slate-300 leading-relaxed max-w-2xl">{result.description}</p>
            </div>
            <button
              onClick={() => onSave({ ...result, deepApplications: deepApps || undefined })}
              className="bg-slate-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              {t.saveRecipe}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composition Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
            {t.sections.composition}
          </h3>
          <CompositionChart composition={result.composition} />
          <div className="mt-4 space-y-2">
            {result.composition.map((comp, idx) => (
               <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-700 pb-1 last:border-0">
                 <span className="text-slate-200 font-mono">{comp.element}</span>
                 <span className="text-slate-400 italic text-xs">{comp.role}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Property Radar */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            {t.sections.properties}
          </h3>
          <PropertyRadar properties={result.properties} />
          <div className="grid grid-cols-2 gap-2 mt-4">
             {result.properties.slice(0, 4).map((prop, idx) => (
               <div key={idx} className="bg-slate-700/50 p-2 rounded">
                 <div className="text-xs text-slate-400">{prop.name}</div>
                 <div className="text-sm font-bold text-white">{prop.predictedValue}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Manufacturing Process */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-400" />
          {t.sections.manufacturing}
        </h3>
        
        <div className="mb-4">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.manufacturing.method}</span>
           <div className="text-lg font-bold text-white mt-1">{manufacturing.method}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Steps */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">{t.manufacturing.steps}</span>
            <div className="space-y-4 relative pl-4 border-l-2 border-slate-700">
               {manufacturing.steps.map((step, idx) => (
                 <div key={idx} className="relative">
                   <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-800"></div>
                   <div className="text-sm font-semibold text-slate-200">{step.step}</div>
                   <div className="text-xs text-slate-400 mt-1">{step.details}</div>
                 </div>
               ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">{t.manufacturing.equipment}</span>
            <div className="grid grid-cols-1 gap-2">
               {manufacturing.specificEquipment.map((eq, idx) => (
                 <div key={idx} className="bg-slate-700/30 border border-slate-700 p-2 rounded flex items-center gap-3">
                   <div className="bg-slate-700 p-1.5 rounded text-slate-400">
                     <Factory className="w-4 h-4" />
                   </div>
                   <span className="text-sm text-slate-300">{eq}</span>
                 </div>
               ))}
               {manufacturing.specificEquipment.length === 0 && (
                 <div className="text-sm text-slate-500 italic">No specific equipment data available.</div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feasibility - Enhanced */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            {t.sections.feasibility}
          </h3>
          
          <div className="flex items-center gap-4 mb-4">
             <div className={`text-2xl font-bold ${
               result.feasibility.level === 'High' ? 'text-emerald-400' : 
               result.feasibility.level === 'Medium' ? 'text-amber-400' : 'text-rose-400'
             }`}>
               {result.feasibility.level}
             </div>
             <div className="h-2 flex-grow bg-slate-700 rounded-full overflow-hidden">
               <div 
                 className={`h-full ${
                    result.feasibility.level === 'High' ? 'bg-emerald-500' : 
                    result.feasibility.level === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                 }`} 
                 style={{ width: `${result.feasibility.score}%` }}
               ></div>
             </div>
             <span className="text-slate-400 text-sm">{result.feasibility.score}%</span>
          </div>

          <div className="space-y-4 flex-grow">
            
            {/* Feasibility Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700/30 p-2 rounded border border-slate-600/50">
                 <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Wrench className="w-3 h-3" /> {t.feasibility.complexity}
                 </div>
                 <div className="text-sm font-medium text-white">{result.feasibility.productionComplexity}</div>
              </div>
              <div className="bg-slate-700/30 p-2 rounded border border-slate-600/50">
                 <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <Leaf className="w-3 h-3" /> {t.feasibility.envImpact}
                 </div>
                 <div className="text-xs text-white line-clamp-2">{result.feasibility.environmentalImpact}</div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.feasibility.challenges}</span>
              <ul className="mt-1 space-y-1">
                {result.feasibility.challenges.map((c, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Cost & Commercial - Enhanced */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            {t.sections.commercial}
          </h3>
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-xs text-slate-400">{t.commercial.estCost}</div>
              <div className="text-lg font-bold text-white">{result.costAnalysis.estimatedCostPerKg}</div>
            </div>
             <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-xs text-slate-400">{t.commercial.availability}</div>
              <div className="text-lg font-bold text-white">{result.costAnalysis.marketAvailability}</div>
            </div>
          </div>

          {/* Bulk Pricing */}
          <div className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t.commercial.bulkPricing}</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-slate-400">{t.commercial.moq}: <span className="text-slate-200">{bulkPricing.minOrderQuantity}</span></span>
               <span className="text-slate-200 font-bold">{bulkPricing.estimatedPriceRange}</span>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="space-y-4 mb-4">
             {/* Materials */}
             {materialBreakdown.length > 0 && (
               <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.commercial.materialBreakdown}</span>
                  <div className="space-y-2 mt-2">
                    {materialBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                         <div className="w-24 shrink-0 text-slate-300 truncate" title={item.item}>{item.item}</div>
                         <div className="flex-grow bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${item.percentage}%` }}></div>
                         </div>
                         <div className="w-8 text-right text-slate-400">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>

          <div className="mt-auto">
             <div className="mb-2">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.commercial.expensive}</span>
               <div className="flex flex-wrap gap-2 mt-1">
                 {result.costAnalysis.expensiveComponents.map((comp, i) => (
                   <span key={i} className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                     {comp}
                   </span>
                 ))}
               </div>
             </div>
             <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-700/50 pt-2">{result.costAnalysis.notes}</p>
          </div>
        </div>
        
        {/* Deep Application Analysis - NEW SECTION */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              {t.sections.deepApps}
            </h3>
          </div>

          {!deepApps && (
            <div className="bg-slate-700/20 border border-slate-600/50 rounded-lg p-6 text-center">
               <h4 className="text-white font-medium mb-2">{t.deepApp.title}</h4>
               <p className="text-slate-400 text-sm mb-4 max-w-lg mx-auto">{t.deepApp.desc}</p>
               <button 
                 onClick={handleDeepAnalysis}
                 className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 mx-auto"
               >
                 <Search className="w-4 h-4" />
                 {t.deepApp.btn}
               </button>
            </div>
          )}

          {deepApps && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deepApps.map((app, idx) => (
                  <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-xs text-cyan-400 font-mono uppercase tracking-wider">{app.industry}</span>
                       <span className={`text-[10px] px-2 py-0.5 rounded border ${
                         app.marketPotential === 'High' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                         app.marketPotential === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                         'bg-slate-500/20 text-slate-300 border-slate-500/30'
                       }`}>
                         {app.marketPotential} Potential
                       </span>
                     </div>
                     <h4 className="font-bold text-white text-lg mb-2">{app.specificProduct}</h4>
                     <p className="text-sm text-slate-300">{app.reason}</p>
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* Historical Data & Case Studies */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            {t.sections.historical}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {result.similarAlloys.map((alloy, idx) => (
               <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{alloy.name}</h4>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Case Study</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 font-mono">{alloy.compositionSummary}</p>
                  <p className="text-sm text-slate-300 mb-2"><span className="text-slate-500">App:</span> {alloy.application}</p>
                  <div className="text-xs text-indigo-300 bg-indigo-900/20 p-2 rounded border border-indigo-500/20">
                     <span className="font-bold">Comparison:</span> {alloy.similarityNote}
                  </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultDashboard;