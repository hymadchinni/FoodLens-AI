import React, { useState } from 'react';
import { RefreshCw, Check, Plus } from 'lucide-react';
import {
  UserAccountBundle,
  MealPlanRecord,
  MealPlanItemRecord,
  VerifiedFoodItem,
  DashboardBundle,
} from '../types.ts';

interface DietPlannerModuleProps {
  account: UserAccountBundle;
  activePlan: MealPlanRecord | null;
  activePlanItems: MealPlanItemRecord[];
  foodsCatalog: VerifiedFoodItem[];
  selectedDate: string;
  getAuthToken: () => Promise<string | null>;
  onPlanUpdated: (plan: MealPlanRecord, items: MealPlanItemRecord[]) => void;
  onDashboardUpdated: (updated: DashboardBundle) => void;
}

export const DietPlannerModule: React.FC<DietPlannerModuleProps> = ({
  account,
  activePlanItems,
  selectedDate,
  getAuthToken,
  onPlanUpdated,
  onDashboardUpdated,
}) => {
  const [variationIdx, setVariationIdx] = useState(1);
  const [regenerating, setRegenerating] = useState(false);
  const [loggingItemId, setLoggingItemId] = useState<number | null>(null);
  const [loggedNotice, setLoggedNotice] = useState<string | null>(null);

  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    setLoggedNotice(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/diet-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variationIndex: variationIdx,
          date: selectedDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.activePlan) {
        onPlanUpdated(data.activePlan, data.activePlanItems);
        setVariationIdx((prev) => prev + 1);
      }
    } finally {
      setRegenerating(false);
    }
  };

  const handleLogPlannedItem = async (item: MealPlanItemRecord) => {
    setLoggingItemId(item.id);
    setLoggedNotice(null);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/scans/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mealType: item.mealSlot,
          logDate: selectedDate,
          imageSummary: item.foodName,
          detectionMethod: 'Diet Plan Log',
          items: [
            {
              foodCode: item.foodCode,
              confirmedPortionG: item.portionGrams,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.dashboard) {
        onDashboardUpdated(data.dashboard);
        setLoggedNotice(`Added ${item.foodName}`);
      }
    } finally {
      setLoggingItemId(null);
    }
  };

  const computedPlanTotals = activePlanItems.reduce(
    (acc, i) => ({
      calories: Math.round(acc.calories + i.caloriesKcal),
      protein: Math.round((acc.protein + i.proteinG) * 10) / 10,
    }),
    { calories: 0, protein: 0 }
  );

  const mealSlots: Array<{
    key: 'breakfast' | 'lunch' | 'snack' | 'dinner';
    title: string;
    timeHint: string;
  }> = [
    { key: 'breakfast', title: 'Breakfast', timeHint: '8:00 AM' },
    { key: 'lunch', title: 'Lunch', timeHint: '1:00 PM' },
    { key: 'snack', title: 'Evening Snack', timeHint: '5:00 PM' },
    { key: 'dinner', title: 'Dinner', timeHint: '8:30 PM' },
  ];

  return (
    <div className="h-full flex flex-col gap-4 min-h-0 overflow-hidden">
      {/* Simple Top Header Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Daily Meal Plan ({account.profile.dietaryPreference.replace('_', '-')})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            Total: {computedPlanTotals.calories} kcal · {computedPlanTotals.protein}g
            protein
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loggedNotice && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {loggedNotice}
            </span>
          )}
          <button
            type="button"
            disabled={regenerating}
            onClick={handleRegeneratePlan}
            className="py-1.5 px-3.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`}
            />
            <span>{regenerating ? 'Updating...' : 'New Plan'}</span>
          </button>
        </div>
      </div>

      {/* Simple 4-Meal Menu List */}
      <div className="flex-1 min-h-0 scroll-pane pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealSlots.map((slot) => {
          const slotItems = activePlanItems.filter(
            (i) => i.mealSlot === slot.key
          );
          const slotCalories = Math.round(
            slotItems.reduce((sum, i) => sum + i.caloriesKcal, 0)
          );
          const slotProtein =
            Math.round(slotItems.reduce((sum, i) => sum + i.proteinG, 0) * 10) /
            10;

          return (
            <div
              key={slot.key}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {slot.title}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {slot.timeHint}
                    </span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                    {slotCalories} kcal · {slotProtein}g P
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                  {slotItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                          {item.foodName}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.portionGrams}g · {item.caloriesKcal} kcal ·{' '}
                          {item.proteinG}g protein
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={loggingItemId === item.id}
                        onClick={() => handleLogPlannedItem(item)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{loggingItemId === item.id ? '...' : 'Log'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
