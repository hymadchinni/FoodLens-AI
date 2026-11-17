import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { UserAccountBundle, DashboardBundle } from '../types.ts';

interface ProgressTrackingModuleProps {
  account: UserAccountBundle;
  dashboard: DashboardBundle;
  selectedDate: string;
  getAuthToken: () => Promise<string | null>;
  onWeightUpdated: (
    account: UserAccountBundle,
    dashboard: DashboardBundle
  ) => void;
}

export const ProgressTrackingModule: React.FC<ProgressTrackingModuleProps> = ({
  account,
  dashboard,
  selectedDate,
  getAuthToken,
  onWeightUpdated,
}) => {
  const [newWeightKg, setNewWeightKg] = useState<string>(
    String(account.profile.weightKg)
  );
  const [savingWeight, setSavingWeight] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWeight(true);
    setSavedNotice(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weightKg: Number(newWeightKg),
          note: 'Weight log',
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.account && data.dashboard) {
        onWeightUpdated(data.account, data.dashboard);
        setSavedNotice(`Updated to ${newWeightKg} kg`);
      }
    } finally {
      setSavingWeight(false);
    }
  };

  const currentWeight = account.profile.weightKg;
  const targetWeight = account.goal.targetWeightKg;
  const startWeight =
    dashboard.weightHistory.length > 0
      ? dashboard.weightHistory[0].weightKg
      : currentWeight;

  const weightDiff = Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10;
  const totalSpan = Math.max(0.5, Math.abs(startWeight - targetWeight));
  const coveredSpan = Math.max(
    0,
    Math.min(totalSpan, Math.abs(startWeight - currentWeight))
  );
  const weightProgressPct =
    weightDiff === 0
      ? 100
      : Math.max(12, Math.min(95, Math.round((coveredSpan / totalSpan) * 100)));

  const recentDays = [...dashboard.dailyHistory].slice(-7).reverse();

  return (
    <div className="h-full flex flex-col gap-5 min-h-0 scroll-pane pr-1">
      {/* 1. Simple Weight Goal Meter (Replaces technical line gauge) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Weight Goal Progress
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {weightDiff === 0
                ? 'You have reached your goal weight!'
                : `${weightDiff} kg away from your target (${targetWeight} kg)`}
            </p>
          </div>

          <form onSubmit={handleLogWeight} className="flex items-center gap-2">
            {savedNotice && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {savedNotice}
              </span>
            )}
            <input
              type="number"
              step="0.1"
              min="30"
              max="280"
              value={newWeightKg}
              onChange={(e) => setNewWeightKg(e.target.value)}
              className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-semibold text-right text-slate-900 dark:text-white"
            />
            <span className="text-xs text-slate-400">kg</span>
            <button
              type="submit"
              disabled={savingWeight}
              className="py-1.5 px-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-medium rounded-lg cursor-pointer"
            >
              {savingWeight ? '...' : 'Update Weight'}
            </button>
          </form>
        </div>

        {/* Simple Visual Start -> Current -> Goal Scale */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono tabular-nums">
            <span className="text-slate-500 dark:text-slate-400">
              Start: <strong className="text-slate-900 dark:text-white">{startWeight} kg</strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              Current: {currentWeight} kg (BMI {account.profile.bmi})
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Goal: <strong className="text-slate-900 dark:text-white">{targetWeight} kg</strong>
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${weightProgressPct}%` }}
            />
          </div>
        </div>

        {/* Recent Weight Check-ins */}
        {dashboard.weightHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-xs">
            {dashboard.weightHistory.slice(-4).map((w) => (
              <div
                key={w.id}
                className="text-slate-500 dark:text-slate-400 font-mono tabular-nums"
              >
                <span>{w.recordedDate.slice(5)}: </span>
                <strong className="text-slate-900 dark:text-white">
                  {w.weightKg} kg
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Simple 7-Day Daily Nutrition Scorecard (Replaces BarChart) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-baseline justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              7-Day Daily Nutrition Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily calories and protein compared with your target ({account.targets.caloriesKcal} kcal · {account.targets.proteinG}g protein)
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentDays.map((day) => {
            const cal = Math.round(day.caloriesConsumed);
            const prot = Math.round(day.proteinConsumedG);
            const calPct = Math.min(
              100,
              Math.round((cal / account.targets.caloriesKcal) * 100)
            );
            const protPct = Math.min(
              100,
              Math.round((prot / account.targets.proteinG) * 100)
            );

            return (
              <div
                key={day.date}
                className="py-3.5 first:pt-1 last:pb-1 grid grid-cols-1 sm:grid-cols-12 items-center gap-3 text-xs"
              >
                <div className="sm:col-span-2 font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {day.date === selectedDate ? 'Today' : day.date.slice(5)}
                </div>

                {/* Calorie Horizontal Progress */}
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex justify-between font-mono tabular-nums text-[11px]">
                    <span className="text-slate-500">Calories</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {cal} / {account.targets.caloriesKcal} kcal ({calPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-slate-200 rounded-full"
                      style={{ width: `${calPct}%` }}
                    />
                  </div>
                </div>

                {/* Protein Horizontal Progress */}
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex justify-between font-mono tabular-nums text-[11px]">
                    <span className="text-slate-500">Protein</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {prot}g / {account.targets.proteinG}g ({protPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${protPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
