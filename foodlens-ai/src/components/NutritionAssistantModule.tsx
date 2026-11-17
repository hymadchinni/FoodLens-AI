import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, Sparkles, MessageSquarePlus, Zap } from 'lucide-react';
import {
  UserAccountBundle,
  ChatMessageRecord,
  MealLogItem,
} from '../types.ts';

interface NutritionAssistantModuleProps {
  account: UserAccountBundle;
  chatHistory: ChatMessageRecord[];
  todayLogs: MealLogItem[];
  selectedDate: string;
  getAuthToken: () => Promise<string | null>;
  onChatHistoryUpdated: (messages: ChatMessageRecord[]) => void;
}

export const NutritionAssistantModule: React.FC<
  NutritionAssistantModuleProps
> = ({
  account,
  chatHistory,
  todayLogs,
  selectedDate,
  getAuthToken,
  onChatHistoryUpdated,
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSpeedLabel, setLastSpeedLabel] = useState<string | null>(null);
  const [localMessages, setLocalMessages] =
    useState<ChatMessageRecord[]>(chatHistory);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalMessages(chatHistory);
  }, [chatHistory]);

  const consumed = todayLogs.reduce(
    (acc, l) => ({
      calories: Math.round(acc.calories + l.caloriesKcal),
      protein: Math.round((acc.protein + l.proteinG) * 10) / 10,
    }),
    { calories: 0, protein: 0 }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, sending]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || sending) return;

    const startMs = performance.now();
    setErrorMsg(null);
    setInput('');

    const nowIso = new Date().toISOString();
    const tempUserMsg: ChatMessageRecord = {
      id: Date.now(),
      userUid: account.user.uid,
      role: 'user',
      message: trimmed,
      contextSnapshot: '',
      createdAt: nowIso,
    };

    setSending(true);
    setLocalMessages((prev) => [...prev, tempUserMsg]);

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      const elapsedSec = ((performance.now() - startMs) / 1000).toFixed(1);
      setLastSpeedLabel(`${elapsedSec}s`);

      if (data.reply) {
        const assistantMsg: ChatMessageRecord = {
          id: Date.now() + 1,
          userUid: account.user.uid,
          role: 'assistant',
          message: data.reply,
          contextSnapshot: '',
          createdAt: new Date().toISOString(),
        };
        setLocalMessages((prev) => {
          const next = [...prev, assistantMsg];
          onChatHistoryUpdated(next);
          return next;
        });
      } else if (Array.isArray(data.chatHistory) && data.chatHistory.length > 0) {
        setLocalMessages(data.chatHistory);
        onChatHistoryUpdated(data.chatHistory);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reach assistant.');
    } finally {
      setSending(false);
    }
  };

  // Format any stored message into a clean, readable breakdown without raw markdown symbols
  const formatCleanPassage = (raw: string) => {
    return raw.replace(/\*\*/g, '').trim();
  };

  return (
    <div className="h-full flex flex-col gap-3 min-h-0 overflow-hidden">
      {/* Minimalist Top Bar (No floating preset food buttons) */}
      <div className="flex items-center justify-between gap-2 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
            Universal AI Food &amp; Nutrition Encyclopedia — Ask about any food in the world
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastSpeedLabel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono">
              <Zap className="w-3 h-3" />
              {lastSpeedLabel}
            </span>
          )}
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {consumed.calories}/{account.targets.caloriesKcal} kcal ·{' '}
            {consumed.protein}/{account.targets.proteinG}g P
          </span>
        </div>
      </div>

      {/* Full-Height Locked Chat Container with Independent Message Scroll */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 scroll-pane p-5 space-y-3">
          {localMessages.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-2">
              <Sparkles className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Ask About Any Food Item in the World
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type any food, fruit, vegetable, dish, meat, grain, snack, or beverage below to get
                its exact calories, protein, carbs, fat, fiber, vitamins, minerals, and what it
                contains.
              </p>
            </div>
          ) : (
            localMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-slate-900 dark:bg-emerald-700 text-white'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-line">
                    {formatCleanPassage(msg.message)}
                  </p>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700 dark:text-emerald-400" />
                <span>Analyzing food &amp; nutrition details...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-900 dark:text-red-200">
              {errorMsg}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Bottom Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
          className="p-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4 text-slate-400 hidden sm:block ml-1 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any food item anywhere in the world (what it contains, protein, calories, vitamins)..."
            className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="py-2 px-4 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
