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
  ArrowRight,
  BookOpen,
  ExternalLink,
  RotateCcw,
  Database
} from 'lucide-react';
import { FoodCommodity, PackagingMaterial, SourceCitation } from '../types/api';
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
  sources?: SourceCitation[];
  databaseMatches?: number;
  modelName?: string;
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
      text: 'Hello! I am your AI Packaging Assistant powered by Groq LLMs and Qdrant semantic retrieval over scientific food packaging standards and barrier research literature.\n\nYou can ask about equilibrium MAP for fresh produce, oxygen & moisture barriers (OTR/WVTR), lipid oxidation in snacks, vacuum packaging, or sustainable bio-polymers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitationIdx, setActiveCitationIdx] = useState<string | null>(null);

  const quickQuestions = [
    'Which packaging materials are suitable for fresh strawberries?',
    'Explain the difference between LDPE and PET for dry food.',
    'Why does a high-fat food require good oxygen protection?',
    'What do OTR and WVTR mean in food packaging?',
    'What packaging considerations matter for high-respiration vegetables?'
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
      // Call backend RAG chat endpoint
      const response = await api.chatAssistant({
        question: queryText,
        focus_commodity_id: selectedCommodityId
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        databaseMatches: response.database_matches,
        modelName: response.model_name
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Error connecting to RAG service: ${err.message || 'Please verify backend and network connectivity.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with food packaging materials today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              AI Packaging Assistant (RAG Grounded)
            </h1>
            <p className="text-xs text-slate-500">
              Grounded answers backed by Qdrant semantic search across peer-reviewed literature and verified USDA/ASTM standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Qdrant + Groq AI</span>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear chat history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="text-xs font-semibold text-slate-700">Quick Science Inquiries:</div>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
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
                className={`max-w-2xl rounded-xl p-4.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                {/* Retrieved Sources & Citations Box */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Retrieved Evidence & Citations ({msg.sources.length} Sources)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src) => (
                        <div
                          key={src.source_id}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 transition-colors text-[11px]"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-800 line-clamp-1">
                              [Source {src.source_id}] {src.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-mono shrink-0">
                              {(src.relevance_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">
                            {src.snippet}
                          </p>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline mt-1 font-medium"
                            >
                              <span>Read Reference</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 flex items-center justify-between ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelName && (
                    <span className="text-[9px] font-mono">Groq: {msg.modelName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-700 animate-pulse" />
              </div>
              <div className="bg-slate-50 text-slate-600 text-xs rounded-xl p-4 border border-slate-200 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Searching Qdrant vector corpus & synthesizing answer via Groq...</span>
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
              <option value="">Focus: All Commodities</option>
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
