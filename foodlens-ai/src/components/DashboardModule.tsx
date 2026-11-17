import React, { useState } from 'react';
import { Camera, Droplets, Plus, Trash2 } from 'lucide-react';
import {
  UserAccountBundle,
  DashboardBundle,
  VerifiedFoodItem,
} from '../types.ts';
import {
  VERIFIED_FOOD_DATABASE,
  calculateNutrientsForPortion,
} from '../data/indianAndUsdaFoods.ts';

interface DashboardModuleProps {
  account: UserAccountBundle;
  dashboard: DashboardBundle;
  foodsCatalog: VerifiedFoodItem[];
  selectedDate: string;
  getAuthToken: () => Promise<string | null>;
  onDashboardUpdated: (updated: DashboardBundle) => void;
  onNavigateTab: (
    tab: 'scanner' | 'planner' | 'assistant' | 'profile' | 'progress'
  ) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  account,
  dashboard,
  selectedDate,
  getAuthToken,
  onDashboardUpdated,
  onNavigateTab,
}) => {
  const [addingQuick, setAddingQuick] = useState(false);
  const [updatingWater, setUpdatingWater] = useState(false);

  const consumed = dashboard.todayLogs.reduce(
    (acc, item) => ({
      calories: Math.round(acc.calories + item.caloriesKcal),
      protein: Math.round((acc.protein + item.proteinG) * 10) / 10,
      carbs: Math.round((acc.carbs + item.carbsG) * 10) / 10,
      fat: Math.round((acc.fat + item.fatG) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const targets = account.targets;
  const remainingCalories = Math.max(0, targets.caloriesKcal - consumed.calories);
  const remainingProtein = Math.max(
    0,
    Math.round((targets.proteinG - consumed.protein) * 10) / 10
  );

  const todayDailyRow = dashboard.dailyHistory.find(
    (d) => d.date === selectedDate
  );
  const currentWaterMl = todayDailyRow?.waterIntakeMl ?? 1750;
  const glassesCount = Math.round(currentWaterMl / 250);

  const recommendedFoods = VERIFIED_FOOD_DATABASE.filter((food) =>
    food.dietaryTags
      .split(',')
      .map((t) => t.trim())
      .includes(account.profile.dietaryPreference)
  )
    .sort((a, b) => b.proteinPer100g - a.proteinPer100g)
    .slice(0, 2);

  const handleWaterAdjust = async (deltaMl: number) => {
    setUpdatingWater(true);
    try {
      const token = await getAuthToken();
      const nextWater = Math.max(0, currentWaterMl + deltaMl);
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          waterIntakeMl: nextWater,
        }),
      });
      const data = await res.json();
      if (res.ok && data.dashboard) {
        onDashboardUpdated(data.dashboard);
      }
    } finally {
      setUpdatingWater(false);
    }
  };

  const handleQuickLogFood = async (foodCode: string, grams: number) => {
    setAddingQuick(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/scans/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealType: 'lunch',
          logDate: selectedDate,
          imageSummary: 'Quick Logged Meal',
          detectionMethod: 'Direct Log',
          items: [{ foodCode, confirmedPortionG: grams }],
        }),
      });
      const data = await res.json();
      if (res.ok && data.dashboard) {
        onDashboardUpdated(data.dashboard);
      }
    } finally {
      setAddingQuick(false);
    }
  };

  const handleDeleteLog = async (logId: number) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/meals/${logId}?date=${selectedDate}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.dashboard) {
        onDashboardUpdated(data.dashboard);
      }
    } catch (err) {
      console.error('Error deleting meal log:', err);
    }
  };

  const macroMeters = [
    {
      label: 'Calories',
      current: `${consumed.calories}`,
      target: `${targets.caloriesKcal} kcal`,
      pct: Math.min(100, Math.round((consumed.calories / targets.caloriesKcal) * 100)),
      barColor: 'bg-slate-900 dark:bg-white',
    },
    {
      label: 'Protein',
      current: `${consumed.protein}g`,
      target: `${targets.proteinG}g`,
      pct: Math.min(100, Math.round((consumed.protein / targets.proteinG) * 100)),
      barColor: 'bg-emerald-600',
    },
    {
      label: 'Carbs',
      current: `${consumed.carbs}g`,
      target: `${targets.carbsG}g`,
      pct: Math.min(100, Math.round((consumed.carbs / targets.carbsG) * 100)),
      barColor: 'bg-amber-500',
    },
    {
      label: 'Fat',
      current: `${consumed.fat}g`,
      target: `${targets.fatG}g`,
      pct: Math.min(100, Math.round((consumed.fat / targets.fatG) * 100)),
      barColor: 'bg-sky-600',
    },
  ];

  return (
    <div className="h-full flex flex-col gap-5 min-h-0 scroll-pane pr-1">
      {/* 1. Simple Daily Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Today&apos;s Nutrition Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {remainingCalories} kcal and {remainingProtein}g protein remaining today
            </p>
          </div>

          {/* Simple Water Intake Counter */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span className="font-mono tabular-nums font-semibold">
                {glassesCount} glasses ({currentWaterMl} ml)
              </span>
            </div>
            <button
              type="button"
              disabled={updatingWater}
              onClick={() => handleWaterAdjust(250)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              +1 Glass
            </button>
          </div>
        </div>

        {/* 4 Clean Horizontal Macro Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {macroMeters.map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {m.label}
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                  {m.current}{' '}
                  <span className="font-normal text-slate-400">/ {m.target}</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${m.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Simple Logged Meals List + Suggested Next Foods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Today's Eaten Meals */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Today&apos;s Meals ({dashboard.todayLogs.length})
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('scanner')}
              className="py-1.5 px-3 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Food</span>
            </button>
          </div>

          {dashboard.todayLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-400">
                No meals logged yet today. Scan a food photo to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dashboard.todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {log.foodName}
                      <span className="text-slate-400 font-normal">
                        {' '}
                        · {log.portionGrams}g ·{' '}
                        <span className="capitalize">{log.mealType}</span>
                      </span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                      {log.caloriesKcal} kcal · {log.proteinG}g protein · {log.carbsG}g
                      carbs · {log.fatG}g fat
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id)}
                    aria-label="Remove meal"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simple Suggested Next Foods */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Suggested Next
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recommendedFoods.map((food) => {
                const grams = food.defaultServingG;
                const calc = calculateNutrientsForPortion(food, grams);
                return (
                  <div
                    key={food.code}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {food.name}
                      </p>
                      <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                        {grams}g · {calc.caloriesKcal} kcal · +{calc.proteinG}g P
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={addingQuick}
                      onClick={() => handleQuickLogFood(food.code, grams)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('planner')}
            className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            View Full Daily Diet Plan →
          </button>
        </div>
      </div>
    </div>
  );
};
