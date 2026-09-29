import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  Sparkles,
  User as UserIcon,
  RefreshCw
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
  failedQuery?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  commodities,
  materials,
  onSelectCommodityForWizard
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `**Welcome to the PackSci AI Technical Assistant.**\n\nI provide scientific food packaging guidance grounded in ASTM standard barrier data (OTR/WVTR), equilibrium modified atmosphere packaging (EMAP), and polymer material science.\n\nAsk about packaging recommendations for specific food commodities, degradation kinetics, barrier metrics, or comparative material evaluations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelName: 'qwen/qwen3.8-27b'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const suggestedQuestions = [
    'What packaging is suitable for wheat flour?',
    'Explain OTR and WVTR.',
    'What is modified atmosphere packaging?',
    'Compare PET and HDPE.',
    'Which packaging materials are suitable for fresh strawberries?'
  ];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.chatAssistant({
        question: trimmed,
        focus_commodity_id: selectedCommodityId
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
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
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to complete request: ${err.message || 'Network or backend service unavailable.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        failedQuery: trimmed
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  };

  const handleRetry = (failedText: string) => {
    handleSendMessage(failedText);
  };

  const handleResetChat = () => {
    if (confirm('Clear the current conversation thread?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          text: `Conversation cleared. How can I assist you with food packaging materials or barrier modeling today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // Helper to format assistant markdown response with basic headings, bold, bullet points
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-xs font-bold text-[#17365D] mt-2 mb-1">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-sm font-bold text-[#17365D] mt-2.5 mb-1">
                {trimmed.replace('## ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={idx} className="text-sm font-extrabold text-[#17365D] mt-3 mb-1">
                {trimmed.replace('# ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
                <span className="text-[#16834A] font-bold text-xs leading-tight mt-0.5">•</span>
                <span className="flex-1">{formatInlineBold(content)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s(.*)$/);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
                <span className="text-[#245A81] font-bold text-[11px] shrink-0 mt-0.5">
                  {match ? match[1] : '1.'}
                </span>
                <span className="flex-1">{formatInlineBold(match ? match[2] : trimmed)}</span>
              </div>
            );
          }
          return <p key={idx} className="leading-relaxed">{formatInlineBold(line)}</p>;
        })}
      </div>
    );
  };

  const formatInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#17365D]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
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

      {/* Commodity Context Selector */}
      <div className="bg-white rounded-lg p-3 border border-[#D8E1EA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-[#5E6B78] shrink-0">
          <FlaskConical className="w-3.5 h-3.5 text-[#245A81]" />
          <span className="font-semibold text-[#17365D]">Focus Commodity Context:</span>
        </div>
        <select
          value={selectedCommodityId || ''}
          onChange={(e) => setSelectedCommodityId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="bg-[#F4F7FA] border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all max-w-full sm:max-w-md"
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
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-[#5E6B78] uppercase tracking-wide">
          Suggested Technical Questions:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded bg-white hover:bg-[#F4F7FA] text-[#245A81] hover:text-[#17365D] border border-[#D8E1EA] shadow-xs transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="bg-white rounded-lg border border-[#D8E1EA] shadow-xs p-4 sm:p-5 space-y-4 min-h-[420px] max-h-[580px] overflow-y-auto">
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
                className={`rounded-lg p-3.5 max-w-[88%] sm:max-w-[82%] space-y-2 border ${
                  isUser
                    ? 'bg-[#17365D] text-white border-[#17365D]'
                    : msg.isError
                    ? 'bg-red-50 text-red-900 border-red-200'
                    : 'bg-[#F4F7FA] text-[#202B38] border-[#D8E1EA]'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-line text-xs font-medium">{msg.text}</p>
                ) : (
                  <div className="text-xs">{renderFormattedText(msg.text)}</div>
                )}

                {/* Error Retry Option */}
                {msg.isError && msg.failedQuery && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleRetry(msg.failedQuery!)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 text-[11px] font-semibold rounded border border-red-300 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                )}

                {/* Qdrant Retrieved Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2.5 border-t border-[#D8E1EA] space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#245A81] uppercase tracking-wide">
                      <BookOpen className="w-3 h-3 text-[#16834A]" />
                      <span>Retrieved Qdrant Literature ({msg.sources.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, i) => (
                        <div
                          key={i}
                          className="p-2 bg-white rounded border border-[#D8E1EA] text-[10px] space-y-1 shadow-2xs"
                        >
                          <div className="font-bold text-[#17365D] line-clamp-1">
                            [{src.source_id}] {src.title}
                          </div>
                          <p className="text-[#5E6B78] line-clamp-2 leading-tight">{src.snippet}</p>
                          <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-slate-100">
                            <span className="text-[#16834A] font-semibold">
                              Relevance: {Math.round(src.relevance_score * 100)}%
                            </span>
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#245A81] hover:underline flex items-center gap-0.5"
                              >
                                <span>Ref</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
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
                    <span className="font-mono text-[9px]">{msg.modelName}</span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-md bg-[#245A81] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-md bg-[#17365D] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="bg-[#F4F7FA] text-[#5E6B78] rounded-lg p-3.5 border border-[#D8E1EA] flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-[#16834A]" />
              <span>Querying Qdrant vector database and generating grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Question Input Bar */}
      <div className="bg-white rounded-lg p-2.5 border border-[#D8E1EA] shadow-xs flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a technical question about food packaging (Press Enter to send, Shift+Enter for newline)..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none resize-none max-h-24 min-h-[34px]"
        />

        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2 rounded-md bg-[#16834A] hover:bg-[#136f3e] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
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
