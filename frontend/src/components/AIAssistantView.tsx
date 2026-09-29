import React, { useState } from 'react';
import {
  Bot,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Loader2,
  Layers
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
  isError?: boolean;
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
      text: 'Welcome to the PackSci AI Technical Assistant. I provide scientific recommendations grounded in ASTM standards, equilibrium modified atmosphere packaging (EMAP), and polymer barrier data.\n\nYou can query food-packaging compatibility, degradation kinetics, barrier metrics (OTR/WVTR), or comparative material selection.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'What packaging is suitable for wheat flour?',
    'Explain OTR and WVTR.',
    'What is modified atmosphere packaging?',
    'Compare PET and HDPE.',
    'Which packaging materials are suitable for fresh strawberries?'
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
        text: `Unable to retrieve answer: ${err.message || 'Check backend service connectivity.'} Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
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
        text: 'Chat session reset. How can I assist you with food packaging science today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>AI Technical Assistant</span>
      </div>

      {/* Header Info Panel */}
      <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#17365D] text-white">
              <Bot className="w-4 h-4 text-emerald-400" />
            </span>
            <h1 className="text-lg font-bold text-[#17365D] tracking-tight">
              AI Packaging Technical Assistant
            </h1>
          </div>
          <p className="text-xs text-[#5E6B78]">
            RAG-powered intelligence grounded on Qdrant vector literature and Groq LLM inference.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F4F7FA] hover:bg-slate-200 text-[#17365D] text-xs font-semibold border border-[#D8E1EA] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#245A81]" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Commodity Filter Strip */}
      <div className="bg-white rounded-lg p-3 border border-[#D8E1EA] shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#5E6B78]">
          <FlaskConical className="w-3.5 h-3.5 text-[#245A81]" />
          <span className="font-semibold text-[#17365D]">Focus Context:</span>
        </div>
        <select
          value={selectedCommodityId || ''}
          onChange={(e) => setSelectedCommodityId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="bg-[#F4F7FA] border border-[#D8E1EA] rounded-md px-2.5 py-1 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
        >
          <option value="">General Packaging & Barrier Science (All Commodities)</option>
          {commodities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.category.replace(/_/g, ' ')})
            </option>
          ))}
        </select>
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#5E6B78] mr-1">Suggested:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-[#F4F7FA] text-[#245A81] hover:text-[#17365D] border border-[#D8E1EA] shadow-xs transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="bg-white rounded-lg border border-[#D8E1EA] shadow-xs p-4 sm:p-5 space-y-4 min-h-[380px] max-h-[550px] overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-md bg-[#17365D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}

              <div
                className={`rounded-lg p-3.5 max-w-[85%] space-y-2 border ${
                  isUser
                    ? 'bg-[#17365D] text-white border-[#17365D]'
                    : msg.isError
                    ? 'bg-red-50 text-red-900 border-red-200'
                    : 'bg-[#F4F7FA] text-[#202B38] border-[#D8E1EA]'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">{msg.text}</div>

                {/* Qdrant Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-[#D8E1EA] space-y-1.5 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#245A81] uppercase tracking-wide">
                      <BookOpen className="w-3 h-3 text-[#16834A]" />
                      <span>Retrieved Literature Sources ({msg.sources.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="p-2 bg-white rounded border border-[#D8E1EA] text-[10px] space-y-0.5"
                        >
                          <div className="font-semibold text-[#17365D] line-clamp-1">
                            {src.title}
                          </div>
                          <p className="text-[#5E6B78] line-clamp-2">{src.snippet}</p>
                          <div className="text-[#16834A] font-semibold text-[9px]">
                            Relevance: {Math.round(src.relevance_score * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] pt-1 flex items-center justify-between ${
                    isUser ? 'text-slate-300' : 'text-[#5E6B78]'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.modelName && (
                    <span>Model: {msg.modelName}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-md bg-[#17365D] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-[#F4F7FA] text-[#5E6B78] rounded-lg p-3 border border-[#D8E1EA] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16834A]" />
              <span>Querying Qdrant vector database and synthesizing with Groq...</span>
            </div>
          </div>
        )}
      </div>

      {/* Question Input Bar */}
      <div className="bg-white rounded-lg p-2.5 border border-[#D8E1EA] shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputText);
            }
          }}
          placeholder="Ask any question regarding food packaging materials, ASTM barriers, or shelf-life..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none"
        />

        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 rounded-md bg-[#16834A] hover:bg-[#136f3e] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
