import React, { useState } from 'react';
import { SimulationParams, SimulationResult } from '../types';
import { generatePhysicsExplanation } from '../services/geminiService';
import { Sparkles, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  params: SimulationParams;
  results: SimulationResult[];
  canGenerate: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ params, results, canGenerate }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const text = await generatePhysicsExplanation(params, results);
      setExplanation(text);
    } catch (e) {
      console.error(e);
      setExplanation("Sorry, I couldn't generate an explanation at this time.");
    } finally {
      setLoading(false);
    }
  };

  if (!canGenerate && !explanation) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <Sparkles className="text-purple-600" /> AI Physics Tutor
        </h3>
        {!explanation && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg shadow-sm border border-indigo-200 hover:bg-indigo-50 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <BookOpen size={18} />}
            {loading ? 'Thinking...' : 'Explain Results'}
          </button>
        )}
      </div>

      {explanation && (
        <div className="prose prose-indigo max-w-none bg-white p-6 rounded-xl border border-indigo-100 shadow-sm animate-in fade-in duration-500">
           <ReactMarkdown>{explanation}</ReactMarkdown>
           <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setExplanation(null)}
                className="text-sm text-slate-500 hover:text-indigo-600 underline"
              >
                Close Explanation
              </button>
           </div>
        </div>
      )}
      
      {!explanation && !loading && (
        <p className="text-slate-600">
          Get a detailed breakdown of why the objects moved (or didn't) based on the forces involved. Powered by Google Gemini.
        </p>
      )}
    </div>
  );
};

export default AIInsights;
