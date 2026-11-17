/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  TrendingUp,
  UserCheck,
  LogOut,
  LogIn,
  RefreshCw,
  AlertCircle,
  Flame,
  Moon,
  Sun,
  Download,
  Award,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { DashboardModule } from './components/DashboardModule.tsx';
import { FoodScannerModule } from './components/FoodScannerModule.tsx';
import { DietPlannerModule } from './components/DietPlannerModule.tsx';
import { ProfileGoalsModule } from './components/ProfileGoalsModule.tsx';
import { NutritionAssistantModule } from './components/NutritionAssistantModule.tsx';
import { ProgressTrackingModule } from './components/ProgressTrackingModule.tsx';
import {
  UserAccountBundle,
  DashboardBundle,
  VerifiedFoodItem,
  AppLanguage,
} from './types.ts';
import { VERIFIED_FOOD_DATABASE } from './data/indianAndUsdaFoods.ts';

type WorkspaceTab =
  | 'scanner'
  | 'dashboard'
  | 'planner'
  | 'assistant'
  | 'progress'
  | 'profile';

const UI_TRANSLATIONS: Record<
  AppLanguage,
  Record<WorkspaceTab | 'dailyIntake' | 'exportPdf', string>
> = {
  en: {
    scanner: 'Scan Food',
    dashboard: 'Dashboard',
    planner: 'Diet Plan',
    assistant: 'AI Chat',
    progress: 'Progress',
    profile: 'Profile',
    dailyIntake: 'Daily Intake',
    exportPdf: 'Export PDF',
  },
  hi: {
    scanner: 'भोजन स्कैन',
    dashboard: 'डैशबोर्ड',
    planner: 'डाइट प्लान',
    assistant: 'AI चैट',
    progress: 'प्रगति',
    profile: 'प्रोफ़ाइल',
    dailyIntake: 'दैनिक सेवन',
    exportPdf: 'PDF रिपोर्ट',
  },
  pa: {
    scanner: 'ਭੋਜਨ ਸਕੈਨ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    planner: 'ਡਾਇਟ ਪਲਾਨ',
    assistant: 'AI ਚੈਟ',
    progress: 'ਤਰੱਕੀ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    dailyIntake: 'ਰੋਜ਼ਾਨਾ ਖੁਰਾਕ',
    exportPdf: 'PDF ਰਿਪੋਰਟ',
  },
};

function MinimalFoodLensApp() {
  const {
    firebaseUser,
    isDemoMode,
    authLoading,
    enterDemoSession,
    signOutUser,
    getAuthToken,
  } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('scanner');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  const [account, setAccount] = useState<UserAccountBundle | null>(null);
  const [dashboard, setDashboard] = useState<DashboardBundle | null>(null);
  const [foodsCatalog, setFoodsCatalog] = useState<VerifiedFoodItem[]>(
    VERIFIED_FOOD_DATABASE
  );
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (darkMode) {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!authLoading && !firebaseUser && !isDemoMode) {
      enterDemoSession();
    }
  }, [authLoading, firebaseUser, isDemoMode, enterDemoSession]);

  const isAuthenticated = Boolean(firebaseUser || isDemoMode);

  const fetchBootstrapData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    setLoadError(null);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const res = await fetch(`/api/bootstrap?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load workspace');
      }
      setAccount(data.account);
      setDashboard(data.dashboard);
      if (Array.isArray(data.foods) && data.foods.length > 0) {
        setFoodsCatalog(data.foods);
      }
    } catch (err: any) {
      console.error('Bootstrap error:', err);
      setLoadError(err.message || 'Could not load nutrition data.');
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated, selectedDate, getAuthToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBootstrapData();
    }
  }, [isAuthenticated, fetchBootstrapData]);

  const t = UI_TRANSLATIONS[language];

  const navItems: Array<{
    id: WorkspaceTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'scanner', label: t.scanner, icon: Camera },
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'planner', label: t.planner, icon: Calendar },
    { id: 'assistant', label: t.assistant, icon: MessageSquare },
    { id: 'progress', label: t.progress, icon: TrendingUp },
    { id: 'profile', label: t.profile, icon: UserCheck },
  ];

  const activeNavLabel =
    navItems.find((n) => n.id === activeTab)?.label || t.scanner;

  // Live daily summary for sidebar mini-meter
  const consumedTotals = (dashboard?.todayLogs || []).reduce(
    (acc, item) => ({
      calories: Math.round(acc.calories + item.caloriesKcal),
      protein: Math.round((acc.protein + item.proteinG) * 10) / 10,
    }),
    { calories: 0, protein: 0 }
  );
  const calorieTarget = account?.targets.caloriesKcal || 2200;
  const proteinTarget = account?.targets.proteinG || 135;
  const calPct = Math.min(
    100,
    Math.round((consumedTotals.calories / calorieTarget) * 100)
  );
  const activeStreakDays = Math.max(
    1,
    (dashboard?.dailyHistory || []).filter((d) => d.caloriesConsumed > 0).length
  );

  const handleExportPdfReport = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* FIXED LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-56 md:h-full bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 shrink-0 flex flex-col justify-between z-20">
        <div>
          {/* Brand Title */}
          <div className="h-14 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              FoodLens AI
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-mono font-semibold text-emerald-800 dark:text-emerald-300">
              <Award className="w-3 h-3" />
              {activeStreakDays}d Streak
            </span>
          </div>

          {/* Left Navigation Menu */}
          <nav className="p-2.5 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Live Daily Intake Meter & Account Control (Desktop) */}
        <div className="hidden md:flex flex-col gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
          {account && (
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
                  <Flame className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  {t.dailyIntake}
                </span>
                <span className="font-mono tabular-nums">{calPct}%</span>
              </div>
              <p className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {consumedTotals.calories}{' '}
                <span className="font-normal text-slate-400">
                  / {calorieTarget} kcal
                </span>
              </p>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${calPct}%` }}
                />
              </div>
              <p className="text-[11px] font-mono tabular-nums text-emerald-800 dark:text-emerald-400 font-medium mt-1.5">
                Protein: {consumedTotals.protein}g / {proteinTarget}g
              </p>
            </button>
          )}

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {account?.user.displayName || 'Member'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {firebaseUser ? account?.user.email : 'Demo Session'}
              </p>
            </div>

            {firebaseUser ? (
              <button
                type="button"
                onClick={signOutUser}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                title="Sign in with Google or Email"
                className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT WORKSPACE COLUMN (LOCKED HEADER + INDEPENDENT SCROLLING SECTION) */}
      <div className="flex-1 h-full min-w-0 flex flex-col overflow-hidden">
        {/* Minimalist Contextual Header */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {activeNavLabel}
            </h1>
            {account && (
              <>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                  ·
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:inline truncate">
                  {account.profile.dietaryPreference.replace('_', '-')} ·{' '}
                  {account.goal.goalType.replace('_', ' ')}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-Language Switcher (English / Hindi / Punjabi) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
              {(
                [
                  { id: 'en', label: 'EN' },
                  { id: 'hi', label: 'हिं' },
                  { id: 'pa', label: 'ਪੰ' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    language === lang.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Export PDF Report */}
            <button
              type="button"
              onClick={handleExportPdfReport}
              title="Export Nutrition Report as PDF"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportPdf}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label="Toggle dark mode"
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <input
              type="date"
              aria-label="Active log date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            />
          </div>
        </header>

        {/* INDEPENDENT SCROLLING VIEWPORT CONTAINER */}
        <main className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6">
          <div className="max-w-6xl mx-auto h-full flex flex-col min-h-0">
            {loadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchBootstrapData}
                  className="px-2.5 py-1 bg-white border border-red-200 rounded-md text-xs font-medium text-red-800 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {loadingData && (!account || !dashboard) ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl animate-pulse" />
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl animate-pulse" />
              </div>
            ) : account && dashboard ? (
              <div className="flex-1 min-h-0">
                {activeTab === 'scanner' && (
                  <FoodScannerModule
                    account={account}
                    foodsCatalog={foodsCatalog}
                    selectedDate={selectedDate}
                    getAuthToken={getAuthToken}
                    onScanConfirmed={(updated) => {
                      setDashboard(updated);
                      setActiveTab('dashboard');
                    }}
                  />
                )}

                {activeTab === 'dashboard' && (
                  <DashboardModule
                    account={account}
                    dashboard={dashboard}
                    foodsCatalog={foodsCatalog}
                    selectedDate={selectedDate}
                    getAuthToken={getAuthToken}
                    onDashboardUpdated={(updated) => setDashboard(updated)}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'planner' && (
                  <DietPlannerModule
                    account={account}
                    activePlan={dashboard.activePlan}
                    activePlanItems={dashboard.activePlanItems}
                    foodsCatalog={foodsCatalog}
                    selectedDate={selectedDate}
                    getAuthToken={getAuthToken}
                    onPlanUpdated={(plan, items) =>
                      setDashboard((prev) =>
                        prev
                          ? { ...prev, activePlan: plan, activePlanItems: items }
                          : prev
                      )
                    }
                    onDashboardUpdated={(updated) => setDashboard(updated)}
                  />
                )}

                {activeTab === 'assistant' && (
                  <NutritionAssistantModule
                    account={account}
                    chatHistory={dashboard.chatHistory}
                    todayLogs={dashboard.todayLogs}
                    selectedDate={selectedDate}
                    getAuthToken={getAuthToken}
                    onChatHistoryUpdated={(messages) =>
                      setDashboard((prev) =>
                        prev ? { ...prev, chatHistory: messages } : prev
                      )
                    }
                  />
                )}

                {activeTab === 'progress' && (
                  <ProgressTrackingModule
                    account={account}
                    dashboard={dashboard}
                    selectedDate={selectedDate}
                    getAuthToken={getAuthToken}
                    onWeightUpdated={(newAcc, newDash) => {
                      setAccount(newAcc);
                      setDashboard(newDash);
                    }}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileGoalsModule
                    account={account}
                    getAuthToken={getAuthToken}
                    onAccountUpdated={(updatedAcc) => setAccount(updatedAcc)}
                  />
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MinimalFoodLensApp />
    </AuthProvider>
  );
}
