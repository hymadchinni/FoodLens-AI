import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { UserAccountBundle } from '../types.ts';
import { calculateMetabolicProfile } from '../data/indianAndUsdaFoods.ts';

interface ProfileGoalsModuleProps {
  account: UserAccountBundle;
  getAuthToken: () => Promise<string | null>;
  onAccountUpdated: (updated: UserAccountBundle) => void;
}

export const ProfileGoalsModule: React.FC<ProfileGoalsModuleProps> = ({
  account,
  getAuthToken,
  onAccountUpdated,
}) => {
  const [age, setAge] = useState(account.profile.age);
  const [heightCm, setHeightCm] = useState(account.profile.heightCm);
  const [weightKg, setWeightKg] = useState(account.profile.weightKg);
  const [sex, setSex] = useState(account.profile.sex);
  const [activityLevel, setActivityLevel] = useState(account.profile.activityLevel);
  const [dietaryPreference, setDietaryPreference] = useState(
    account.profile.dietaryPreference
  );
  const [allergies, setAllergies] = useState(account.profile.allergies || '');
  const [restrictions, setRestrictions] = useState(
    account.profile.restrictions || ''
  );
  const [goalType, setGoalType] = useState(account.goal.goalType);
  const [targetWeightKg, setTargetWeightKg] = useState(
    account.goal.targetWeightKg
  );

  const [isCustomOverride, setIsCustomOverride] = useState(
    account.targets.isCustomOverride
  );
  const [customCalories, setCustomCalories] = useState(
    account.targets.caloriesKcal
  );
  const [customProtein, setCustomProtein] = useState(account.targets.proteinG);
  const [customCarbs, setCustomCarbs] = useState(account.targets.carbsG);
  const [customFat, setCustomFat] = useState(account.targets.fatG);
  const [customWater, setCustomWater] = useState(account.targets.waterMl);

  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const liveEstimate = calculateMetabolicProfile({
    age: Number(age) || 25,
    heightCm: Number(heightCm) || 170,
    weightKg: Number(weightKg) || 70,
    sex,
    activityLevel,
    goalType,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedBanner(false);
    setErrorMsg(null);

    if (age < 14 || age > 100 || heightCm < 100 || heightCm > 240 || weightKg < 30 || weightKg > 280) {
      setErrorMsg('Please enter valid age (14–100), height (100–240 cm), and weight (30–280 kg).');
      setSaving(false);
      return;
    }

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number(age),
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          sex,
          activityLevel,
          dietaryPreference,
          allergies,
          restrictions,
          goalType,
          targetWeightKg: Number(targetWeightKg),
          customTargets: {
            isCustomOverride,
            caloriesKcal: Number(customCalories),
            proteinG: Number(customProtein),
            carbsG: Number(customCarbs),
            fatG: Number(customFat),
            waterMl: Number(customWater),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      onAccountUpdated(data.account);
      setSavedBanner(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-y-auto lg:overflow-hidden">
      {/* Left: Independently Scrollable Form */}
      <form
        onSubmit={handleSaveProfile}
        className="lg:col-span-7 lg:h-full scroll-pane bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Body Profile & Preferences
          </h2>
          {savedBanner && (
            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Age</label>
            <input
              type="number"
              min={14}
              max={100}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tabular-nums text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              min={100}
              max={240}
              step={0.5}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tabular-nums text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              min={30}
              max={280}
              step={0.1}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tabular-nums text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unspecified">Unspecified</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
              <option value="very_active">Athletic</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Goal</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="weight_loss">Lose Weight</option>
              <option value="muscle_gain">Gain Muscle</option>
              <option value="maintenance">Maintain Weight</option>
              <option value="diabetic_friendly">Diabetic-Friendly</option>
              <option value="healthy_lifestyle">Healthy Lifestyle</option>
              <option value="balanced">Balanced Nutrition</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Dietary Preference
            </label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="eggetarian">Eggetarian</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Target Weight (kg)
            </label>
            <input
              type="number"
              min={30}
              max={250}
              step={0.5}
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono tabular-nums text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Allergies (triggers scan warnings)
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g., dairy, gluten, nuts, soy, eggs"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Health Conditions (diabetes, high BP, cholesterol)
            </label>
            <input
              type="text"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="e.g., diabetes, high bp, high cholesterol"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-medium text-slate-700">
              Custom Target Override
            </span>
            <input
              type="checkbox"
              checked={isCustomOverride}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsCustomOverride(checked);
                if (checked) {
                  setCustomCalories(liveEstimate.caloriesKcal);
                  setCustomProtein(liveEstimate.proteinG);
                  setCustomCarbs(liveEstimate.carbsG);
                  setCustomFat(liveEstimate.fatG);
                  setCustomWater(liveEstimate.waterMl);
                }
              }}
              className="w-4 h-4 accent-slate-900"
            />
          </label>

          {isCustomOverride && (
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  kcal
                </label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Right: Stationary Live Metabolic Targets Summary */}
      <div className="lg:col-span-5 lg:h-full scroll-pane bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
          Live Estimated Daily Needs
        </h2>

        <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-50 rounded-xl font-mono tabular-nums">
          <div>
            <p className="text-[11px] font-sans text-slate-400">BMI</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {liveEstimate.bmi}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-slate-400">BMR</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {liveEstimate.bmr}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-sans text-slate-400">TDEE</p>
            <p className="text-sm font-bold text-emerald-800 mt-0.5">
              {liveEstimate.tdee}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs font-mono tabular-nums">
          <div className="py-2.5 flex justify-between">
            <span className="font-sans text-slate-500">Calories</span>
            <span className="font-bold text-slate-900">
              {isCustomOverride ? customCalories : liveEstimate.caloriesKcal} kcal
            </span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-sans text-slate-500">Protein</span>
            <span className="font-bold text-emerald-800">
              {isCustomOverride ? customProtein : liveEstimate.proteinG} g
            </span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-sans text-slate-500">Carbohydrates</span>
            <span className="font-bold text-slate-900">
              {isCustomOverride ? customCarbs : liveEstimate.carbsG} g
            </span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-sans text-slate-500">Fat</span>
            <span className="font-bold text-slate-900">
              {isCustomOverride ? customFat : liveEstimate.fatG} g
            </span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="font-sans text-slate-500">Water</span>
            <span className="font-bold text-slate-900">
              {isCustomOverride ? customWater : liveEstimate.waterMl} ml
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
          BMI, BMR, and TDEE are mathematical estimates and do not alone determine health. Override targets on the left if needed.
        </p>
      </div>
    </div>
  );
};
