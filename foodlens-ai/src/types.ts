export type AppLanguage = 'en' | 'hi' | 'pa';

export interface VerifiedFoodItem {
  id?: number;
  code: string;
  name: string;
  hindiName: string;
  category: string;
  dietaryTags: string;
  allergenTags: string;
  sourceDatabase: string;
  defaultServingG: number;
  servingUnitLabel: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  sugarPer100g: number;
  sodiumMgPer100g: number;
  ironMgPer100g: number;
  calciumMgPer100g: number;
  vitaminAMcgPer100g?: number;
  vitaminCMgPer100g?: number;
  vitaminDMcgPer100g?: number;
  vitaminB12McgPer100g?: number;
}

export interface UserProfile {
  id: number;
  userUid: string;
  age: number;
  heightCm: number;
  weightKg: number;
  sex: string;
  activityLevel: string;
  dietaryPreference: string;
  allergies: string;
  restrictions: string;
  bmi: number;
  bmr: number;
  tdee: number;
}

export interface FitnessGoal {
  id: number;
  userUid: string;
  goalType: string;
  targetWeightKg: number;
  weeklyRateKg: number;
  notes: string;
}

export interface NutritionTargets {
  id: number;
  userUid: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  isCustomOverride: boolean;
}

export interface UserAccountBundle {
  user: {
    id: number;
    uid: string;
    email: string;
    displayName: string;
  };
  profile: UserProfile;
  goal: FitnessGoal;
  targets: NutritionTargets;
}

export interface MealLogItem {
  id: number;
  userUid: string;
  scanId?: number | null;
  logDate: string;
  mealType: string;
  foodCode: string;
  foodName: string;
  portionGrams: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  loggedAt: string;
}

export interface DailyNutritionEntry {
  id: number;
  userUid: string;
  date: string;
  caloriesConsumed: number;
  proteinConsumedG: number;
  carbsConsumedG: number;
  fatConsumedG: number;
  fiberConsumedG: number;
  waterIntakeMl: number;
}

export interface WeightHistoryEntry {
  id: number;
  userUid: string;
  recordedDate: string;
  weightKg: number;
  bmi: number;
  note: string;
}

export interface MealPlanRecord {
  id: number;
  userUid: string;
  planDate: string;
  goalContext: string;
  dietaryPreference: string;
  totalCaloriesKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  aiExplanation: string;
}

export interface MealPlanItemRecord {
  id: number;
  planId: number;
  mealSlot: string;
  foodCode: string;
  foodName: string;
  servingLabel: string;
  portionGrams: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  rationale: string;
}

export interface ChatMessageRecord {
  id: number;
  userUid: string;
  role: 'user' | 'assistant';
  message: string;
  contextSnapshot: string;
  createdAt: string;
}

export interface FoodScanRecord {
  id: number;
  userUid: string;
  mealType: string;
  imageSummary: string;
  detectionMethod: string;
  totalCaloriesKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  status: string;
  scannedAt: string;
}

export interface DashboardBundle {
  todayLogs: MealLogItem[];
  dailyHistory: DailyNutritionEntry[];
  recentScans: FoodScanRecord[];
  weightHistory: WeightHistoryEntry[];
  activePlan: MealPlanRecord | null;
  activePlanItems: MealPlanItemRecord[];
  chatHistory: ChatMessageRecord[];
}

export interface NutrientBreakdown {
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  ironMg: number;
  calciumMg: number;
  vitaminAMcg: number;
  vitaminCMg: number;
  vitaminDMcg: number;
  vitaminB12Mcg: number;
}

export interface ScannedFoodCandidate {
  foodCode: string;
  name: string;
  customLabel?: string;
  hindiName: string;
  whatItContains?: string;
  category: string;
  sourceDatabase: string;
  servingUnitLabel: string;
  estimatedPortionG: number;
  confirmedPortionG: number;
  confidenceScore: number;
  visualRegion: string;
  nutrients: NutrientBreakdown;
  per100g?: {
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    fiberPer100g: number;
    sugarPer100g: number;
    sodiumMgPer100g: number;
    ironMgPer100g: number;
    calciumMgPer100g: number;
    vitaminAMcgPer100g?: number;
    vitaminCMgPer100g?: number;
    vitaminDMcgPer100g?: number;
    vitaminB12McgPer100g?: number;
  };
}

export interface HealthSwapSuggestion {
  fromFoodCode: string;
  fromFoodName: string;
  toFoodCode: string;
  toFoodName: string;
  caloriesSavedKcal: number;
  reason: string;
}

export interface MealHealthInsight {
  healthScore: number;
  scoreReason: string;
  conflictAlerts: Array<{
    severity: 'high' | 'medium';
    type: 'allergy' | 'diet' | 'health_condition';
    message: string;
  }>;
  healthierSwaps: HealthSwapSuggestion[];
}
