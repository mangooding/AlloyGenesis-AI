import React, { useState, useEffect } from 'react';
import { Trash2, Download, Clock, Database } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import type { SavedRecipe } from '../types';

interface RecipeHistoryProps {
  language: 'en' | 'zh';
  onLoadRecipe: (recipe: SavedRecipe) => void;
}

const RecipeHistory: React.FC<RecipeHistoryProps> = ({ language, onLoadRecipe }) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cloud' | 'local'>('cloud');
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session && activeTab === 'cloud') {
      fetchCloudRecipes();
    }
  }, [user, session, activeTab]);

  const fetchCloudRecipes = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setRecipes(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`/api/recipes/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLoadRecipe = (recipe: any) => {
    const formattedRecipe: SavedRecipe = {
      ...recipe,
      alloyName: recipe.alloy_name,
      codeName: recipe.code_name,
      costAnalysis: recipe.cost_analysis,
      deepApplications: recipe.deep_applications,
      similarAlloys: recipe.similar_alloys,
      originalRequirements: recipe.original_requirements,
      timestamp: new Date(recipe.created_at).getTime(),
    };
    onLoadRecipe(formattedRecipe);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-slate-400">
        <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{language === 'zh' ? '请先登录以查看云端配方' : 'Sign in to view cloud recipes'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'cloud'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {language === 'zh' ? '云端配方' : 'Cloud Recipes'}
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'local'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {language === 'zh' ? '本地配方' : 'Local Recipes'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'cloud' && (
        <div className="space-y-2">
          {isLoading && (
            <div className="text-center text-slate-400">
              {language === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {recipes.length === 0 && !isLoading && (
            <div className="text-center text-slate-400 py-4">
              {language === 'zh' ? '暂无云端配方' : 'No cloud recipes yet'}
            </div>
          )}

          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleLoadRecipe(recipe)}
                >
                  <h4 className="font-medium text-white hover:text-indigo-400 transition-colors">
                    {recipe.alloy_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(recipe.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                  title={language === 'zh' ? '删除' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeHistory;
