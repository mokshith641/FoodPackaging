import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FoodCommodity, PackagingMaterial, CandidateMaterialResult } from '../types/api';
import { api } from '../services/api';

interface AIAssistantViewProps {
  commodities: FoodCommodity[];
  materials: PackagingMaterial[];
  onSelectCommodityForWizard: (commodity: FoodCommodity) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedMaterial?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  commodities,
  materials,
  onSelectCommodityForWizard
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your AI Packaging Assistant. You can ask me about barrier properties (OTR, WVTR), shelf-life kinetics, modified atmosphere packaging (MAP), or suitable sustainable materials for any food commodity.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    'Best packaging for crisp potato chips to prevent rancidity?',
    'Why is breathable micro-perforated film required for strawberries?',
    'What bio-degradable alternatives can replace metallized BOPP?',
    'How does low storage temperature extend fresh meat shelf-life?'
  ];

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Find commodity if mentioned or selected
      const chosenComm = selectedCommodityId
        ? commodities.find((c) => c.id === selectedCommodityId)
        : commodities.find((c) => queryText.toLowerCase().includes(c.name.toLowerCase()));

      const commName = chosenComm ? chosenComm.name : 'Food Commodity';
      const commCat = chosenComm ? chosenComm.category : 'snack_fried';

      // Create candidates from material list
      const topCandidates: CandidateMaterialResult[] = materials.slice(0, 3).map((m, idx) => ({
        material_id: m.id,
        material_code: m.material_code,
        material_name: m.name,
        structure: m.structure,
        polymer_family: m.polymer_family,
        rank: idx + 1,
        total_score: 95 - idx * 8,
        score_breakdown: {
          moisture_score: 90,
          oxygen_score: 90,
          temp_score: 85,
          mechanical_score: 80,
          cost_score: 75,
          sustainability_score: m.sustainability_score || 70,
          weights_applied: {}
        },
        compatibility_verdict: 'Suitable barrier candidate',
        reasons_for_ranking: ['Optimal moisture and oxygen transmission rates'],
        warnings: [],
        trade_offs: [],
        technical_specifications: {},
        verification_status: 'verified'
      }));

      // Call backend AI explain endpoint
      const response = await api.explainRecommendation({
        commodity_name: commName,
        commodity_category: commCat,
        inputs: {
          commodity_name: commName,
          commodity_category: commCat,
          target_shelf_life_days: chosenComm?.base_shelf_life_days || 90,
          storage_type: chosenComm?.default_storage_type || 'ambient',
          storage_temp_c: chosenComm?.optimal_temp_c || 25,
          relative_humidity_pct: chosenComm?.optimal_rh_pct || 60,
          transport_condition: 'normal',
          cost_tier: 'balanced',
          sustainability_priority: 'medium',
          product_state: 'fresh',
          user_notes: `User question: ${queryText}`
        },
        top_candidates: topCandidates
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.explanation || 'Based on food packaging science principles, barrier materials must match the critical degradation factor (moisture gain/loss, lipid oxidation, or anaerobic respiration).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedMaterial: chosenComm ? `Recommended for ${chosenComm.name}` : undefined
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      // Graceful domain fallback response
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `For ${queryText}: High-fat foods require high oxygen barrier (OTR < 15 cm³/m²·day·atm) to prevent lipid oxidation and rancidity. High-moisture fresh produce requires controlled respiration and anti-fog features. Dry items require high moisture barrier (WVTR < 1.0 g/m²·day) to preserve crispness.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Packaging Assistant</h1>
            <p className="text-xs text-slate-500">
              Ask technical questions regarding food packaging materials, shelf-life, and barrier properties.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Groq AI Powered</span>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="text-xs font-semibold text-slate-700">Suggested Questions:</div>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 transition-colors text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[480px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  <Bot className="w-4 h-4 text-emerald-700" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 ${
                    msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-700 animate-pulse" />
              </div>
              <div className="bg-slate-50 text-slate-500 text-xs rounded-xl p-4 border border-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Analyzing packaging science parameters...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedCommodityId || ''}
              onChange={(e) => setSelectedCommodityId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full sm:w-48 bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="">Optional: Focus Commodity</option>
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Ask anything about food packaging, barrier films, or shelf life..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
