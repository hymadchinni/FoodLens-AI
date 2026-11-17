import { db } from './index.ts';
import {
  users,
  userProfiles,
  fitnessGoals,
  nutritionTargets,
  foodItems,
  foodScans,
  detectedFoods,
  mealLogs,
  mealPlans,
  mealPlanItems,
  dailyNutrition,
  weightHistory,
  chatbotConversations,
} from './schema.ts';
import { eq, and, desc, asc } from 'drizzle-orm';
import {
  VERIFIED_FOOD_DATABASE,
  calculateMetabolicProfile,
  calculateNutrientsForPortion,
} from '../data/indianAndUsdaFoods.ts';

import fs from 'fs';
import path from 'path';

// ============================================================================
// AUTOMATIC LOCAL NODE.JS DISK + MEMORY STORE (./data/local-db.json)
// Used automatically on a laptop when PostgreSQL (SQL_HOST) is not configured
// ============================================================================
interface LocalUserStore {
  user: any;
  profile: any;
  goal: any;
  targets: any;
  mealLogs: any[];
  dailyNutrition: Record<string, any>;
  weightHistory: any[];
  recentScans: any[];
  activePlan: any | null;
  activePlanItems: any[];
  chatHistory: any[];
}

const LOCAL_DB_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'local-db.json');

const localMemoryUsers = new Map<string, LocalUserStore>();
let nextLocalId = 100;
let useLocalMemoryFallback = !process.env.SQL_HOST && !process.env.DATABASE_URL;

function loadLocalDbFromDisk() {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf8'));
      if (raw && typeof raw.users === 'object') {
        for (const [uid, store] of Object.entries(raw.users)) {
          localMemoryUsers.set(uid, store as LocalUserStore);
        }
      }
      if (typeof raw.nextLocalId === 'number') {
        nextLocalId = Math.max(nextLocalId, raw.nextLocalId);
      }
    }
  } catch (err) {
    console.warn('Could not read local-db.json, starting fresh local store:', err);
  }
}

function saveLocalDbToDisk() {
  try {
    if (!fs.existsSync(LOCAL_DB_DIR)) {
      fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
    }
    const serialized: Record<string, LocalUserStore> = {};
    for (const [uid, store] of localMemoryUsers.entries()) {
      serialized[uid] = store;
    }
    fs.writeFileSync(
      LOCAL_DB_FILE,
      JSON.stringify({ nextLocalId, users: serialized }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.warn('Could not write local-db.json:', err);
  }
}

loadLocalDbFromDisk();

function getOrCreateLocalUserStore(
  uid: string,
  email: string,
  displayName?: string
): LocalUserStore {
  const existing = localMemoryUsers.get(uid);
  if (existing) {
    return existing;
  }

  const today = new Date().toISOString().split('T')[0];
  const defaultMeta = calculateMetabolicProfile({
    age: 25,
    heightCm: 172,
    weightKg: 71.5,
    sex: 'male',
    activityLevel: 'moderate',
    goalType: 'balanced',
  });

  const user = {
    id: nextLocalId++,
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'FoodLens Member',
    createdAt: new Date().toISOString(),
  };

  const profile = {
    id: nextLocalId++,
    userUid: uid,
    age: 25,
    heightCm: 172,
    weightKg: 71.5,
    sex: 'male',
    activityLevel: 'moderate',
    dietaryPreference: 'vegetarian',
    allergies: '',
    restrictions: '',
    bmi: defaultMeta.bmi,
    bmr: defaultMeta.bmr,
    tdee: defaultMeta.tdee,
  };

  const goal = {
    id: nextLocalId++,
    userUid: uid,
    goalType: 'balanced',
    targetWeightKg: 68.5,
    weeklyRateKg: 0.3,
    notes: 'Build lean muscle while maintaining balanced Indian vegetarian meals',
  };

  const targets = {
    id: nextLocalId++,
    userUid: uid,
    caloriesKcal: defaultMeta.caloriesKcal,
    proteinG: defaultMeta.proteinG,
    carbsG: defaultMeta.carbsG,
    fatG: defaultMeta.fatG,
    fiberG: defaultMeta.fiberG,
    waterMl: defaultMeta.waterMl,
    isCustomOverride: false,
  };

  const seedEntries = [
    { code: 'idli_steamed', mealType: 'breakfast', grams: 120 },
    { code: 'sambar_veg', mealType: 'breakfast', grams: 150 },
    { code: 'coconut_chutney', mealType: 'breakfast', grams: 35 },
    { code: 'rice_basmati', mealType: 'lunch', grams: 150 },
    { code: 'dal_tadka', mealType: 'lunch', grams: 150 },
    { code: 'palak_paneer', mealType: 'lunch', grams: 130 },
    { code: 'kachumber_salad', mealType: 'lunch', grams: 80 },
  ];

  const seededLogs: any[] = [];
  for (const entry of seedEntries) {
    const food = VERIFIED_FOOD_DATABASE.find((f) => f.code === entry.code);
    if (food) {
      const calc = calculateNutrientsForPortion(food, entry.grams);
      seededLogs.push({
        id: nextLocalId++,
        userUid: uid,
        scanId: null,
        logDate: today,
        mealType: entry.mealType,
        foodCode: food.code,
        foodName: food.name,
        portionGrams: entry.grams,
        caloriesKcal: calc.caloriesKcal,
        proteinG: calc.proteinG,
        carbsG: calc.carbsG,
        fatG: calc.fatG,
        fiberG: calc.fiberG,
        sugarG: calc.sugarG,
        sodiumMg: calc.sodiumMg,
        loggedAt: new Date().toISOString(),
      });
    }
  }

  const dailyMap: Record<string, any> = {};
  const weights: any[] = [];

  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const cals = 1950 + ((i * 85) % 350);
    const prot = 108 + ((i * 9) % 32);
    const carbs = 215 + ((i * 14) % 45);
    const fat = 62 + ((i * 5) % 16);
    dailyMap[dateStr] = {
      id: nextLocalId++,
      userUid: uid,
      date: dateStr,
      caloriesConsumed: cals,
      proteinConsumedG: prot,
      carbsConsumedG: carbs,
      fatConsumedG: fat,
      fiberConsumedG: 28 + (i % 7),
      waterIntakeMl: 2200 + (i % 3) * 250,
    };

    const w = Math.round((72.4 - (6 - i) * 0.15) * 10) / 10;
    const bmiVal = Math.round((w / (1.72 * 1.72)) * 10) / 10;
    weights.push({
      id: nextLocalId++,
      userUid: uid,
      recordedDate: dateStr,
      weightKg: w,
      bmi: bmiVal,
      note: i === 6 ? 'Baseline check-in' : 'Morning weigh-in',
    });
  }

  const store: LocalUserStore = {
    user,
    profile,
    goal,
    targets,
    mealLogs: seededLogs,
    dailyNutrition: dailyMap,
    weightHistory: weights,
    recentScans: [],
    activePlan: null,
    activePlanItems: [],
    chatHistory: [],
  };

  localMemoryUsers.set(uid, store);
  recomputeLocalDailyTotals(store, today);
  return store;
}

function recomputeLocalDailyTotals(store: LocalUserStore, dateStr: string) {
  const logs = store.mealLogs.filter((l) => l.logDate === dateStr);
  const totals = logs.reduce(
    (acc, item) => ({
      calories: Math.round((acc.calories + item.caloriesKcal) * 10) / 10,
      protein: Math.round((acc.protein + item.proteinG) * 10) / 10,
      carbs: Math.round((acc.carbs + item.carbsG) * 10) / 10,
      fat: Math.round((acc.fat + item.fatG) * 10) / 10,
      fiber: Math.round((acc.fiber + item.fiberG) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const existing = store.dailyNutrition[dateStr];
  store.dailyNutrition[dateStr] = {
    id: existing?.id || nextLocalId++,
    userUid: store.user.uid,
    date: dateStr,
    caloriesConsumed: totals.calories,
    proteinConsumedG: totals.protein,
    carbsConsumedG: totals.carbs,
    fatConsumedG: totals.fat,
    fiberConsumedG: totals.fiber,
    waterIntakeMl: existing?.waterIntakeMl ?? 1750,
  };
  saveLocalDbToDisk();
}

// Ensure Verified Food Database is seeded
let isFoodDbSeeded = false;
export async function ensureFoodDatabaseSeeded() {
  if (useLocalMemoryFallback || isFoodDbSeeded) return;
  try {
    const existing = await db.select().from(foodItems).limit(1);
    if (existing.length === 0) {
      for (const item of VERIFIED_FOOD_DATABASE) {
        await db
          .insert(foodItems)
          .values(item)
          .onConflictDoUpdate({
            target: foodItems.code,
            set: {
              name: item.name,
              caloriesPer100g: item.caloriesPer100g,
              proteinPer100g: item.proteinPer100g,
              carbsPer100g: item.carbsPer100g,
              fatPer100g: item.fatPer100g,
            },
          });
      }
    }
    isFoodDbSeeded = true;
  } catch (error) {
    console.warn('PostgreSQL unavailable, switching to Local Node.js In-Memory Store:', error);
    useLocalMemoryFallback = true;
  }
}

// Get or create user + default profile, fitness goal, nutrition targets, and initial sample logs
export async function getOrCreateFullUserAccount(
  uid: string,
  email: string,
  displayName?: string
) {
  await ensureFoodDatabaseSeeded();

  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, email, displayName);
    return {
      user: store.user,
      profile: store.profile,
      goal: store.goal,
      targets: store.targets,
    };
  }

  try {
    const userRes = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || email.split('@')[0] || 'FoodLens Member',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email },
      })
      .returning();

    const user = userRes[0];

    let profileRows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userUid, uid));

    if (profileRows.length === 0) {
      const defaultMeta = calculateMetabolicProfile({
        age: 25,
        heightCm: 172,
        weightKg: 71.5,
        sex: 'male',
        activityLevel: 'moderate',
        goalType: 'muscle_gain',
      });

      profileRows = await db
        .insert(userProfiles)
        .values({
          userUid: uid,
          age: 25,
          heightCm: 172,
          weightKg: 71.5,
          sex: 'male',
          activityLevel: 'moderate',
          dietaryPreference: 'vegetarian',
          allergies: '',
          restrictions: '',
          bmi: defaultMeta.bmi,
          bmr: defaultMeta.bmr,
          tdee: defaultMeta.tdee,
        })
        .onConflictDoNothing()
        .returning();

      if (profileRows.length === 0) {
        profileRows = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userUid, uid));
      }
    }

    let goalRows = await db
      .select()
      .from(fitnessGoals)
      .where(eq(fitnessGoals.userUid, uid));

    if (goalRows.length === 0) {
      goalRows = await db
        .insert(fitnessGoals)
        .values({
          userUid: uid,
          goalType: 'balanced',
          targetWeightKg: 68.5,
          weeklyRateKg: 0.3,
          notes: 'Build lean muscle while maintaining balanced Indian vegetarian meals',
        })
        .onConflictDoNothing()
        .returning();

      if (goalRows.length === 0) {
        goalRows = await db
          .select()
          .from(fitnessGoals)
          .where(eq(fitnessGoals.userUid, uid));
      }
    }

    let targetRows = await db
      .select()
      .from(nutritionTargets)
      .where(eq(nutritionTargets.userUid, uid));

    if (targetRows.length === 0) {
      const profile = profileRows[0];
      const goal = goalRows[0];
      const meta = calculateMetabolicProfile({
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        sex: profile.sex,
        activityLevel: profile.activityLevel,
        goalType: goal.goalType,
      });

      targetRows = await db
        .insert(nutritionTargets)
        .values({
          userUid: uid,
          caloriesKcal: meta.caloriesKcal,
          proteinG: meta.proteinG,
          carbsG: meta.carbsG,
          fatG: meta.fatG,
          fiberG: meta.fiberG,
          waterMl: meta.waterMl,
          isCustomOverride: false,
        })
        .onConflictDoNothing()
        .returning();

      if (targetRows.length === 0) {
        targetRows = await db
          .select()
          .from(nutritionTargets)
          .where(eq(nutritionTargets.userUid, uid));
      }
    }

    const existingLogs = await db
      .select()
      .from(mealLogs)
      .where(eq(mealLogs.userUid, uid))
      .limit(1);

    if (existingLogs.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const seedEntries = [
        { code: 'idli_steamed', mealType: 'breakfast', grams: 120 },
        { code: 'sambar_veg', mealType: 'breakfast', grams: 150 },
        { code: 'coconut_chutney', mealType: 'breakfast', grams: 35 },
        { code: 'rice_basmati', mealType: 'lunch', grams: 150 },
        { code: 'dal_tadka', mealType: 'lunch', grams: 150 },
        { code: 'palak_paneer', mealType: 'lunch', grams: 130 },
        { code: 'kachumber_salad', mealType: 'lunch', grams: 80 },
      ];

      for (const entry of seedEntries) {
        const food = VERIFIED_FOOD_DATABASE.find((f) => f.code === entry.code);
        if (food) {
          const calc = calculateNutrientsForPortion(food, entry.grams);
          await db.insert(mealLogs).values({
            userUid: uid,
            logDate: today,
            mealType: entry.mealType,
            foodCode: food.code,
            foodName: food.name,
            portionGrams: entry.grams,
            caloriesKcal: calc.caloriesKcal,
            proteinG: calc.proteinG,
            carbsG: calc.carbsG,
            fatG: calc.fatG,
            fiberG: calc.fiberG,
            sugarG: calc.sugarG,
            sodiumMg: calc.sodiumMg,
          });
        }
      }

      for (let i = 6; i >= 1; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const cals = 1950 + ((i * 85) % 350);
        const prot = 108 + ((i * 9) % 32);
        const carbs = 215 + ((i * 14) % 45);
        const fat = 62 + ((i * 5) % 16);
        await db.insert(dailyNutrition).values({
          userUid: uid,
          date: dateStr,
          caloriesConsumed: cals,
          proteinConsumedG: prot,
          carbsConsumedG: carbs,
          fatConsumedG: fat,
          fiberConsumedG: 28 + (i % 7),
          waterIntakeMl: 2200 + (i % 3) * 250,
        });

        const w = Math.round((72.4 - (6 - i) * 0.15) * 10) / 10;
        const bmiVal = Math.round((w / (1.72 * 1.72)) * 10) / 10;
        await db.insert(weightHistory).values({
          userUid: uid,
          recordedDate: dateStr,
          weightKg: w,
          bmi: bmiVal,
          note: i === 6 ? 'Baseline check-in' : 'Morning weigh-in',
        });
      }

      await syncDailyNutritionTotals(uid, today);
    }

    return {
      user,
      profile: profileRows[0],
      goal: goalRows[0],
      targets: targetRows[0],
    };
  } catch (error) {
    console.warn('Database error, falling back to Local Node.js Store:', error);
    useLocalMemoryFallback = true;
    const store = getOrCreateLocalUserStore(uid, email, displayName);
    return {
      user: store.user,
      profile: store.profile,
      goal: store.goal,
      targets: store.targets,
    };
  }
}

export async function syncDailyNutritionTotals(uid: string, dateStr: string) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    recomputeLocalDailyTotals(store, dateStr);
    return;
  }

  try {
    const logs = await db
      .select()
      .from(mealLogs)
      .where(and(eq(mealLogs.userUid, uid), eq(mealLogs.logDate, dateStr)));

    const totals = logs.reduce(
      (acc, item) => ({
        calories: Math.round((acc.calories + item.caloriesKcal) * 10) / 10,
        protein: Math.round((acc.protein + item.proteinG) * 10) / 10,
        carbs: Math.round((acc.carbs + item.carbsG) * 10) / 10,
        fat: Math.round((acc.fat + item.fatG) * 10) / 10,
        fiber: Math.round((acc.fiber + item.fiberG) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const existing = await db
      .select()
      .from(dailyNutrition)
      .where(and(eq(dailyNutrition.userUid, uid), eq(dailyNutrition.date, dateStr)));

    if (existing.length > 0) {
      await db
        .update(dailyNutrition)
        .set({
          caloriesConsumed: totals.calories,
          proteinConsumedG: totals.protein,
          carbsConsumedG: totals.carbs,
          fatConsumedG: totals.fat,
          fiberConsumedG: totals.fiber,
          updatedAt: new Date(),
        })
        .where(eq(dailyNutrition.id, existing[0].id));
    } else {
      await db.insert(dailyNutrition).values({
        userUid: uid,
        date: dateStr,
        caloriesConsumed: totals.calories,
        proteinConsumedG: totals.protein,
        carbsConsumedG: totals.carbs,
        fatConsumedG: totals.fat,
        fiberConsumedG: totals.fiber,
        waterIntakeMl: 1750,
      });
    }
  } catch (error) {
    console.warn('Sync daily nutrition fallback to local store:', error);
    useLocalMemoryFallback = true;
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    recomputeLocalDailyTotals(store, dateStr);
  }
}

export async function getAllFoodItemsFromDb() {
  await ensureFoodDatabaseSeeded();
  if (useLocalMemoryFallback) {
    return VERIFIED_FOOD_DATABASE;
  }
  try {
    return await db.select().from(foodItems).orderBy(asc(foodItems.name));
  } catch (error) {
    console.warn('Fallback to static VERIFIED_FOOD_DATABASE:', error);
    return VERIFIED_FOOD_DATABASE;
  }
}

export async function updateUserProfileAndTargets(
  uid: string,
  payload: {
    age: number;
    heightCm: number;
    weightKg: number;
    sex: string;
    activityLevel: string;
    dietaryPreference: string;
    allergies: string;
    restrictions: string;
    goalType: string;
    targetWeightKg: number;
    customTargets?: {
      caloriesKcal?: number;
      proteinG?: number;
      carbsG?: number;
      fatG?: number;
      waterMl?: number;
      isCustomOverride?: boolean;
    };
  }
) {
  const meta = calculateMetabolicProfile({
    age: payload.age,
    heightCm: payload.heightCm,
    weightKg: payload.weightKg,
    sex: payload.sex,
    activityLevel: payload.activityLevel,
    goalType: payload.goalType,
  });

  const isCustom = Boolean(payload.customTargets?.isCustomOverride);
  const finalTargets = {
    caloriesKcal:
      isCustom && payload.customTargets?.caloriesKcal
        ? payload.customTargets.caloriesKcal
        : meta.caloriesKcal,
    proteinG:
      isCustom && payload.customTargets?.proteinG
        ? payload.customTargets.proteinG
        : meta.proteinG,
    carbsG:
      isCustom && payload.customTargets?.carbsG
        ? payload.customTargets.carbsG
        : meta.carbsG,
    fatG:
      isCustom && payload.customTargets?.fatG
        ? payload.customTargets.fatG
        : meta.fatG,
    fiberG: meta.fiberG,
    waterMl:
      isCustom && payload.customTargets?.waterMl
        ? payload.customTargets.waterMl
        : meta.waterMl,
    isCustomOverride: isCustom,
    updatedAt: new Date(),
  };

  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    store.profile = {
      ...store.profile,
      age: payload.age,
      heightCm: payload.heightCm,
      weightKg: payload.weightKg,
      sex: payload.sex,
      activityLevel: payload.activityLevel,
      dietaryPreference: payload.dietaryPreference,
      allergies: payload.allergies,
      restrictions: payload.restrictions,
      bmi: meta.bmi,
      bmr: meta.bmr,
      tdee: meta.tdee,
    };
    store.goal = {
      ...store.goal,
      goalType: payload.goalType,
      targetWeightKg: payload.targetWeightKg,
    };
    store.targets = {
      ...store.targets,
      ...finalTargets,
    };
    const today = new Date().toISOString().split('T')[0];
    store.weightHistory.push({
      id: nextLocalId++,
      userUid: uid,
      recordedDate: today,
      weightKg: payload.weightKg,
      bmi: meta.bmi,
      note: 'Updated via profile calibration',
    });
    saveLocalDbToDisk();
    return { meta, finalTargets };
  }

  try {
    await db
      .update(userProfiles)
      .set({
        age: payload.age,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg,
        sex: payload.sex,
        activityLevel: payload.activityLevel,
        dietaryPreference: payload.dietaryPreference,
        allergies: payload.allergies,
        restrictions: payload.restrictions,
        bmi: meta.bmi,
        bmr: meta.bmr,
        tdee: meta.tdee,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userUid, uid));

    await db
      .update(fitnessGoals)
      .set({
        goalType: payload.goalType,
        targetWeightKg: payload.targetWeightKg,
        updatedAt: new Date(),
      })
      .where(eq(fitnessGoals.userUid, uid));

    await db
      .update(nutritionTargets)
      .set(finalTargets)
      .where(eq(nutritionTargets.userUid, uid));

    const today = new Date().toISOString().split('T')[0];
    await db.insert(weightHistory).values({
      userUid: uid,
      recordedDate: today,
      weightKg: payload.weightKg,
      bmi: meta.bmi,
      note: 'Updated via profile calibration',
    });

    return { meta, finalTargets };
  } catch (error) {
    console.warn('Profile update fallback to local store:', error);
    useLocalMemoryFallback = true;
    return updateUserProfileAndTargets(uid, payload);
  }
}

export async function recordConfirmedFoodScanAndLogMeal(
  uid: string,
  payload: {
    mealType: string;
    logDate: string;
    imageSummary: string;
    detectionMethod: string;
    items: Array<{
      foodCode: string;
      foodName?: string;
      confirmedPortionG: number;
      estimatedPortionG?: number;
      confidenceScore?: number;
      nutrients?: {
        caloriesKcal: number;
        proteinG: number;
        carbsG: number;
        fatG: number;
        fiberG: number;
        sugarG: number;
        sodiumMg: number;
      };
    }>;
  }
) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const enrichedItems = payload.items.map((item) => {
    const verifiedFood = VERIFIED_FOOD_DATABASE.find(
      (f) => f.code === item.foodCode
    );
    const nutrients =
      item.nutrients && (!verifiedFood || item.foodCode === 'custom_detected')
        ? item.nutrients
        : calculateNutrientsForPortion(
            verifiedFood || VERIFIED_FOOD_DATABASE[0],
            item.confirmedPortionG
          );

    totalCalories += nutrients.caloriesKcal;
    totalProtein += nutrients.proteinG;
    totalCarbs += nutrients.carbsG;
    totalFat += nutrients.fatG;

    return {
      foodCode: verifiedFood ? verifiedFood.code : item.foodCode || 'custom_detected',
      foodName:
        item.foodName ||
        (verifiedFood ? verifiedFood.name : 'Recognized Food Item'),
      confirmedPortionG: item.confirmedPortionG,
      estimatedPortionG: item.estimatedPortionG ?? item.confirmedPortionG,
      confidenceScore: item.confidenceScore ?? 0.94,
      nutrients,
    };
  });

  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    const scan = {
      id: nextLocalId++,
      userUid: uid,
      mealType: payload.mealType,
      imageSummary: payload.imageSummary || 'Multi-item meal scan',
      detectionMethod: payload.detectionMethod,
      totalCaloriesKcal: Math.round(totalCalories * 10) / 10,
      totalProteinG: Math.round(totalProtein * 10) / 10,
      totalCarbsG: Math.round(totalCarbs * 10) / 10,
      totalFatG: Math.round(totalFat * 10) / 10,
      status: 'confirmed',
      scannedAt: new Date().toISOString(),
    };
    store.recentScans.unshift(scan);
    for (const entry of enrichedItems) {
      store.mealLogs.push({
        id: nextLocalId++,
        userUid: uid,
        scanId: scan.id,
        logDate: payload.logDate,
        mealType: payload.mealType,
        foodCode: entry.foodCode,
        foodName: entry.foodName,
        portionGrams: entry.confirmedPortionG,
        caloriesKcal: entry.nutrients.caloriesKcal,
        proteinG: entry.nutrients.proteinG,
        carbsG: entry.nutrients.carbsG,
        fatG: entry.nutrients.fatG,
        fiberG: entry.nutrients.fiberG,
        sugarG: entry.nutrients.sugarG,
        sodiumMg: entry.nutrients.sodiumMg,
        loggedAt: new Date().toISOString(),
      });
    }
    recomputeLocalDailyTotals(store, payload.logDate);
    return scan;
  }

  try {
    const scanRows = await db
      .insert(foodScans)
      .values({
        userUid: uid,
        mealType: payload.mealType,
        imageSummary: payload.imageSummary || 'Multi-item meal scan',
        detectionMethod: payload.detectionMethod,
        totalCaloriesKcal: Math.round(totalCalories * 10) / 10,
        totalProteinG: Math.round(totalProtein * 10) / 10,
        totalCarbsG: Math.round(totalCarbs * 10) / 10,
        totalFatG: Math.round(totalFat * 10) / 10,
        status: 'confirmed',
      })
      .returning();

    const scan = scanRows[0];

    for (const entry of enrichedItems) {
      await db.insert(detectedFoods).values({
        scanId: scan.id,
        foodCode: entry.foodCode,
        detectedName: entry.foodName,
        confidenceScore: entry.confidenceScore,
        estimatedPortionG: entry.estimatedPortionG,
        confirmedPortionG: entry.confirmedPortionG,
        caloriesKcal: entry.nutrients.caloriesKcal,
        proteinG: entry.nutrients.proteinG,
        carbsG: entry.nutrients.carbsG,
        fatG: entry.nutrients.fatG,
      });

      await db.insert(mealLogs).values({
        userUid: uid,
        scanId: scan.id,
        logDate: payload.logDate,
        mealType: payload.mealType,
        foodCode: entry.foodCode,
        foodName: entry.foodName,
        portionGrams: entry.confirmedPortionG,
        caloriesKcal: entry.nutrients.caloriesKcal,
        proteinG: entry.nutrients.proteinG,
        carbsG: entry.nutrients.carbsG,
        fatG: entry.nutrients.fatG,
        fiberG: entry.nutrients.fiberG,
        sugarG: entry.nutrients.sugarG,
        sodiumMg: entry.nutrients.sodiumMg,
      });
    }

    await syncDailyNutritionTotals(uid, payload.logDate);

    return scan;
  } catch (error) {
    console.warn('Scan confirm fallback to local store:', error);
    useLocalMemoryFallback = true;
    return recordConfirmedFoodScanAndLogMeal(uid, payload);
  }
}

export async function deleteMealLogEntry(uid: string, logId: number) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    const target = store.mealLogs.find((l) => l.id === logId);
    store.mealLogs = store.mealLogs.filter((l) => l.id !== logId);
    if (target) {
      recomputeLocalDailyTotals(store, target.logDate);
    }
    return { deleted: true };
  }

  try {
    const rows = await db
      .select()
      .from(mealLogs)
      .where(and(eq(mealLogs.id, logId), eq(mealLogs.userUid, uid)));

    if (rows.length > 0) {
      const logDate = rows[0].logDate;
      await db
        .delete(mealLogs)
        .where(and(eq(mealLogs.id, logId), eq(mealLogs.userUid, uid)));
      await syncDailyNutritionTotals(uid, logDate);
    }
    return { deleted: true };
  } catch (error) {
    console.warn('Delete meal fallback to local store:', error);
    useLocalMemoryFallback = true;
    return deleteMealLogEntry(uid, logId);
  }
}

export async function updateWaterIntake(uid: string, dateStr: string, waterMl: number) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    recomputeLocalDailyTotals(store, dateStr);
    store.dailyNutrition[dateStr].waterIntakeMl = Math.max(0, waterMl);
    saveLocalDbToDisk();
    return { waterIntakeMl: Math.max(0, waterMl) };
  }

  try {
    await syncDailyNutritionTotals(uid, dateStr);
    const existing = await db
      .select()
      .from(dailyNutrition)
      .where(and(eq(dailyNutrition.userUid, uid), eq(dailyNutrition.date, dateStr)));

    if (existing.length > 0) {
      await db
        .update(dailyNutrition)
        .set({ waterIntakeMl: Math.max(0, waterMl), updatedAt: new Date() })
        .where(eq(dailyNutrition.id, existing[0].id));
    }
    return { waterIntakeMl: Math.max(0, waterMl) };
  } catch (error) {
    console.warn('Water update fallback to local store:', error);
    useLocalMemoryFallback = true;
    return updateWaterIntake(uid, dateStr, waterMl);
  }
}

export async function getDashboardSummaryData(uid: string, dateStr: string) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    recomputeLocalDailyTotals(store, dateStr);
    const todayLogs = store.mealLogs.filter((l) => l.logDate === dateStr);
    const dailyHistory = Object.values(store.dailyNutrition).sort((a: any, b: any) =>
      String(a.date).localeCompare(String(b.date))
    );
    return {
      todayLogs,
      dailyHistory,
      recentScans: store.recentScans.slice(0, 10),
      weightHistory: store.weightHistory,
      activePlan: store.activePlan,
      activePlanItems: store.activePlanItems,
      chatHistory: store.chatHistory,
    };
  }

  try {
    await syncDailyNutritionTotals(uid, dateStr);

    const todayLogs = await db
      .select()
      .from(mealLogs)
      .where(and(eq(mealLogs.userUid, uid), eq(mealLogs.logDate, dateStr)))
      .orderBy(asc(mealLogs.id));

    const dailyRows = await db
      .select()
      .from(dailyNutrition)
      .where(eq(dailyNutrition.userUid, uid))
      .orderBy(desc(dailyNutrition.date))
      .limit(14);

    const recentScans = await db
      .select()
      .from(foodScans)
      .where(eq(foodScans.userUid, uid))
      .orderBy(desc(foodScans.scannedAt))
      .limit(10);

    const weights = await db
      .select()
      .from(weightHistory)
      .where(eq(weightHistory.userUid, uid))
      .orderBy(asc(weightHistory.recordedDate))
      .limit(20);

    const plans = await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userUid, uid))
      .orderBy(desc(mealPlans.createdAt))
      .limit(1);

    let activePlanItems: typeof mealPlanItems.$inferSelect[] = [];
    if (plans.length > 0) {
      activePlanItems = await db
        .select()
        .from(mealPlanItems)
        .where(eq(mealPlanItems.planId, plans[0].id));
    }

    const chatHistory = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.userUid, uid))
      .orderBy(asc(chatbotConversations.createdAt))
      .limit(30);

    return {
      todayLogs,
      dailyHistory: dailyRows.reverse(),
      recentScans,
      weightHistory: weights,
      activePlan: plans[0] || null,
      activePlanItems,
      chatHistory,
    };
  } catch (error) {
    console.warn('Dashboard summary fallback to local store:', error);
    useLocalMemoryFallback = true;
    return getDashboardSummaryData(uid, dateStr);
  }
}

export async function saveGeneratedMealPlanToDb(
  uid: string,
  planData: {
    planDate: string;
    goalContext: string;
    dietaryPreference: string;
    totalCaloriesKcal: number;
    totalProteinG: number;
    totalCarbsG: number;
    totalFatG: number;
    aiExplanation: string;
    items: Array<{
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
    }>;
  }
) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    const planId = nextLocalId++;
    const plan = {
      id: planId,
      userUid: uid,
      planDate: planData.planDate,
      goalContext: planData.goalContext,
      dietaryPreference: planData.dietaryPreference,
      totalCaloriesKcal: planData.totalCaloriesKcal,
      totalProteinG: planData.totalProteinG,
      totalCarbsG: planData.totalCarbsG,
      totalFatG: planData.totalFatG,
      aiExplanation: planData.aiExplanation,
      createdAt: new Date().toISOString(),
    };
    const items = planData.items.map((item) => ({
      id: nextLocalId++,
      planId,
      ...item,
    }));
    store.activePlan = plan;
    store.activePlanItems = items;
    saveLocalDbToDisk();
    return { plan, items };
  }

  try {
    const insertedPlan = await db
      .insert(mealPlans)
      .values({
        userUid: uid,
        planDate: planData.planDate,
        goalContext: planData.goalContext,
        dietaryPreference: planData.dietaryPreference,
        totalCaloriesKcal: planData.totalCaloriesKcal,
        totalProteinG: planData.totalProteinG,
        totalCarbsG: planData.totalCarbsG,
        totalFatG: planData.totalFatG,
        aiExplanation: planData.aiExplanation,
      })
      .returning();

    const plan = insertedPlan[0];
    const itemsToReturn = [];

    for (const item of planData.items) {
      const row = await db
        .insert(mealPlanItems)
        .values({
          planId: plan.id,
          mealSlot: item.mealSlot,
          foodCode: item.foodCode,
          foodName: item.foodName,
          servingLabel: item.servingLabel,
          portionGrams: item.portionGrams,
          caloriesKcal: item.caloriesKcal,
          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
          rationale: item.rationale,
        })
        .returning();
      itemsToReturn.push(row[0]);
    }

    return { plan, items: itemsToReturn };
  } catch (error) {
    console.warn('Meal plan save fallback to local store:', error);
    useLocalMemoryFallback = true;
    return saveGeneratedMealPlanToDb(uid, planData);
  }
}

export async function appendChatMessages(
  uid: string,
  userMessage: string,
  assistantMessage: string,
  contextSnapshot: string
) {
  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    store.chatHistory.push({
      id: nextLocalId++,
      userUid: uid,
      role: 'user',
      message: userMessage,
      contextSnapshot,
      createdAt: new Date().toISOString(),
    });
    const savedReply = {
      id: nextLocalId++,
      userUid: uid,
      role: 'assistant',
      message: assistantMessage,
      contextSnapshot,
      createdAt: new Date().toISOString(),
    };
    store.chatHistory.push(savedReply);
    saveLocalDbToDisk();
    return savedReply;
  }

  try {
    await db.insert(chatbotConversations).values({
      userUid: uid,
      role: 'user',
      message: userMessage,
      contextSnapshot,
    });
    const savedReply = await db
      .insert(chatbotConversations)
      .values({
        userUid: uid,
        role: 'assistant',
        message: assistantMessage,
        contextSnapshot,
      })
      .returning();
    return savedReply[0];
  } catch (error) {
    console.warn('Chat save fallback to local store:', error);
    useLocalMemoryFallback = true;
    return appendChatMessages(uid, userMessage, assistantMessage, contextSnapshot);
  }
}

export async function addWeightCheckin(
  uid: string,
  weightKg: number,
  heightCm: number,
  recordedDate: string,
  note: string
) {
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  if (useLocalMemoryFallback) {
    const store = getOrCreateLocalUserStore(uid, 'demo@foodlens.ai');
    const entry = {
      id: nextLocalId++,
      userUid: uid,
      recordedDate,
      weightKg,
      bmi,
      note,
    };
    store.weightHistory.push(entry);
    store.profile.weightKg = weightKg;
    store.profile.bmi = bmi;
    saveLocalDbToDisk();
    return entry;
  }

  try {
    const row = await db
      .insert(weightHistory)
      .values({
        userUid: uid,
        recordedDate,
        weightKg,
        bmi,
        note,
      })
      .returning();

    await db
      .update(userProfiles)
      .set({ weightKg, bmi, updatedAt: new Date() })
      .where(eq(userProfiles.userUid, uid));

    return row[0];
  } catch (error) {
    console.warn('Weight check-in fallback to local store:', error);
    useLocalMemoryFallback = true;
    return addWeightCheckin(uid, weightKg, heightCm, recordedDate, note);
  }
}
