import { relations } from 'drizzle-orm';
import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

// 1. users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').default('FoodLens Member'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. user_profiles
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull()
    .unique(),
  age: integer('age').notNull().default(26),
  heightCm: real('height_cm').notNull().default(172),
  weightKg: real('weight_kg').notNull().default(70),
  sex: text('sex').notNull().default('male'), // 'male' | 'female' | 'unspecified'
  activityLevel: text('activity_level').notNull().default('moderate'), // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  dietaryPreference: text('dietary_preference').notNull().default('vegetarian'), // 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian'
  allergies: text('allergies').default(''), // comma-separated
  restrictions: text('restrictions').default(''), // comma-separated
  bmi: real('bmi').notNull().default(23.7),
  bmr: integer('bmr').notNull().default(1668),
  tdee: integer('tdee').notNull().default(2585),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. fitness_goals
export const fitnessGoals = pgTable('fitness_goals', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull()
    .unique(),
  goalType: text('goal_type').notNull().default('balanced'), // 'weight_loss' | 'muscle_gain' | 'maintenance' | 'healthy_lifestyle' | 'balanced'
  targetWeightKg: real('target_weight_kg').notNull().default(68),
  weeklyRateKg: real('weekly_rate_kg').notNull().default(0.3),
  notes: text('notes').default('Prioritize high-protein traditional Indian home meals'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. nutrition_targets
export const nutritionTargets = pgTable('nutrition_targets', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull()
    .unique(),
  caloriesKcal: integer('calories_kcal').notNull().default(2200),
  proteinG: integer('protein_g').notNull().default(135),
  carbsG: integer('carbs_g').notNull().default(245),
  fatG: integer('fat_g').notNull().default(70),
  fiberG: integer('fiber_g').notNull().default(32),
  waterMl: integer('water_ml').notNull().default(2800),
  isCustomOverride: boolean('is_custom_override').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. food_items (Verified USDA + IFCT Indian Food Composition Database)
export const foodItems = pgTable('food_items', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  hindiName: text('hindi_name').default(''),
  category: text('category').notNull(), // 'grain' | 'lentil' | 'dairy_protein' | 'meat_egg' | 'south_indian' | 'vegetable' | 'fruit' | 'complete_dish'
  dietaryTags: text('dietary_tags').notNull(), // 'vegan,vegetarian,eggetarian,non_vegetarian'
  allergenTags: text('allergen_tags').default(''), // 'dairy', 'gluten', 'eggs', 'nuts', 'soy'
  sourceDatabase: text('source_database').notNull().default('IFCT 2017 / USDA FDC'),
  defaultServingG: integer('default_serving_g').notNull().default(100),
  servingUnitLabel: text('serving_unit_label').notNull().default('1 medium bowl (150g)'),
  // Values strictly per 100g edible portion
  caloriesPer100g: real('calories_per_100g').notNull(),
  proteinPer100g: real('protein_per_100g').notNull(),
  carbsPer100g: real('carbs_per_100g').notNull(),
  fatPer100g: real('fat_per_100g').notNull(),
  fiberPer100g: real('fiber_per_100g').notNull(),
  sugarPer100g: real('sugar_per_100g').notNull(),
  sodiumMgPer100g: real('sodium_mg_per_100g').notNull(),
  ironMgPer100g: real('iron_mg_per_100g').default(1.2),
  calciumMgPer100g: real('calcium_mg_per_100g').default(45),
});

// 6. food_scans
export const foodScans = pgTable('food_scans', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  mealType: text('meal_type').notNull().default('lunch'), // 'breakfast' | 'lunch' | 'snack' | 'dinner'
  imageSummary: text('image_summary').notNull(),
  detectionMethod: text('detection_method').notNull().default('Gemini Vision Multi-Item + Portion Heuristics'),
  totalCaloriesKcal: real('total_calories_kcal').notNull().default(0),
  totalProteinG: real('total_protein_g').notNull().default(0),
  totalCarbsG: real('total_carbs_g').notNull().default(0),
  totalFatG: real('total_fat_g').notNull().default(0),
  status: text('status').notNull().default('confirmed'), // 'pending' | 'confirmed'
  scannedAt: timestamp('scanned_at').defaultNow(),
});

// 7. detected_foods
export const detectedFoods = pgTable('detected_foods', {
  id: serial('id').primaryKey(),
  scanId: integer('scan_id')
    .references(() => foodScans.id)
    .notNull(),
  foodCode: text('food_code').notNull(),
  detectedName: text('detected_name').notNull(),
  confidenceScore: real('confidence_score').notNull().default(0.92),
  estimatedPortionG: real('estimated_portion_g').notNull(),
  confirmedPortionG: real('confirmed_portion_g').notNull(),
  boundingBoxJson: text('bounding_box_json').default('{}'),
  caloriesKcal: real('calories_kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
});

// 8. meal_logs
export const mealLogs = pgTable('meal_logs', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  scanId: integer('scan_id'),
  logDate: text('log_date').notNull(), // YYYY-MM-DD
  mealType: text('meal_type').notNull(), // 'breakfast' | 'lunch' | 'snack' | 'dinner'
  foodCode: text('food_code').notNull(),
  foodName: text('food_name').notNull(),
  portionGrams: real('portion_grams').notNull(),
  caloriesKcal: real('calories_kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  fiberG: real('fiber_g').notNull().default(0),
  sugarG: real('sugar_g').notNull().default(0),
  sodiumMg: real('sodium_mg').notNull().default(0),
  loggedAt: timestamp('logged_at').defaultNow(),
});

// 9. meal_plans
export const mealPlans = pgTable('meal_plans', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  planDate: text('plan_date').notNull(), // YYYY-MM-DD
  goalContext: text('goal_context').notNull(),
  dietaryPreference: text('dietary_preference').notNull(),
  totalCaloriesKcal: integer('total_calories_kcal').notNull(),
  totalProteinG: integer('total_protein_g').notNull(),
  totalCarbsG: integer('total_carbs_g').notNull(),
  totalFatG: integer('total_fat_g').notNull(),
  aiExplanation: text('ai_explanation').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. meal_plan_items
export const mealPlanItems = pgTable('meal_plan_items', {
  id: serial('id').primaryKey(),
  planId: integer('plan_id')
    .references(() => mealPlans.id)
    .notNull(),
  mealSlot: text('meal_slot').notNull(), // 'breakfast' | 'lunch' | 'snack' | 'dinner'
  foodCode: text('food_code').notNull(),
  foodName: text('food_name').notNull(),
  servingLabel: text('serving_label').notNull(),
  portionGrams: real('portion_grams').notNull(),
  caloriesKcal: real('calories_kcal').notNull(),
  proteinG: real('protein_g').notNull(),
  carbsG: real('carbs_g').notNull(),
  fatG: real('fat_g').notNull(),
  rationale: text('rationale').default(''),
});

// 11. daily_nutrition
export const dailyNutrition = pgTable('daily_nutrition', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  caloriesConsumed: real('calories_consumed').notNull().default(0),
  proteinConsumedG: real('protein_consumed_g').notNull().default(0),
  carbsConsumedG: real('carbs_consumed_g').notNull().default(0),
  fatConsumedG: real('fat_consumed_g').notNull().default(0),
  fiberConsumedG: real('fiber_consumed_g').notNull().default(0),
  waterIntakeMl: integer('water_intake_ml').notNull().default(1500),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 12. weight_history
export const weightHistory = pgTable('weight_history', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  recordedDate: text('recorded_date').notNull(), // YYYY-MM-DD
  weightKg: real('weight_kg').notNull(),
  bmi: real('bmi').notNull(),
  note: text('note').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. chatbot_conversations
export const chatbotConversations = pgTable('chatbot_conversations', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  message: text('message').notNull(),
  contextSnapshot: text('context_snapshot').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.uid],
    references: [userProfiles.userUid],
  }),
  fitnessGoal: one(fitnessGoals, {
    fields: [users.uid],
    references: [fitnessGoals.userUid],
  }),
  nutritionTarget: one(nutritionTargets, {
    fields: [users.uid],
    references: [nutritionTargets.userUid],
  }),
  mealLogs: many(mealLogs),
  foodScans: many(foodScans),
  mealPlans: many(mealPlans),
  weightHistory: many(weightHistory),
  chatbotConversations: many(chatbotConversations),
}));
