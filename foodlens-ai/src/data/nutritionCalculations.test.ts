/**
 * Unit Tests for FoodLens AI Deterministic Nutrition & Metabolic Engine
 * Run with: npx tsx src/data/nutritionCalculations.test.ts
 */
import assert from 'node:assert/strict';
import {
  VERIFIED_FOOD_DATABASE,
  calculateNutrientsForPortion,
  calculateMetabolicProfile,
  evaluateMealHealthAndSwaps,
  parseNaturalLanguageFoodInput,
} from './indianAndUsdaFoods.ts';

export function runNutritionUnitTests() {
  // 1. Test Portion Scaling & Micronutrient Calculation
  const paneer = VERIFIED_FOOD_DATABASE.find((f) => f.code === 'paneer_tikka')!;
  const p100 = calculateNutrientsForPortion(paneer, 100);
  const p200 = calculateNutrientsForPortion(paneer, 200);
  assert.equal(p100.caloriesKcal, 258, '100g Paneer Tikka should equal 258 kcal');
  assert.equal(p200.caloriesKcal, 516, '200g Paneer Tikka should scale linearly to 516 kcal');
  assert.equal(p200.proteinG, 37.2, '200g Paneer Tikka should yield 37.2g protein');
  assert.ok(p100.calciumMg > 400, 'Paneer should include verified calcium (>400mg/100g)');
  assert.ok(p100.vitaminB12Mcg > 0, 'Paneer should include Vitamin B12');

  // 2. Test Mifflin-St Jeor BMR / TDEE & Goal Targets
  const maleLoss = calculateMetabolicProfile({
    age: 28,
    heightCm: 175,
    weightKg: 75,
    sex: 'male',
    activityLevel: 'moderate',
    goalType: 'weight_loss',
  });
  assert.equal(maleLoss.bmr, 1709, 'BMR for 28yo 175cm 75kg male should be 1709 kcal');
  assert.equal(maleLoss.tdee, 2649, 'Moderate TDEE (1.55x) should be 2649 kcal');
  assert.equal(maleLoss.caloriesKcal, 2199, 'Weight loss target should subtract 450 kcal');

  // 3. Test Meal Health Score & Allergy/Diet Conflict Detection
  const parsedItems = parseNaturalLanguageFoodInput(
    '1 plate chole bhature + 100g paneer tikka'
  );
  assert.equal(parsedItems.length, 2, 'Should parse both Chole Bhature and Paneer Tikka');

  const insights = evaluateMealHealthAndSwaps(parsedItems, {
    dietaryPreference: 'vegan',
    allergies: 'dairy, gluten',
    restrictions: 'high bp',
    goalType: 'weight_loss',
  });
  assert.ok(
    insights.conflictAlerts.some((a) => a.type === 'diet'),
    'Should flag dairy dishes when user is vegan'
  );
  assert.ok(
    insights.conflictAlerts.some((a) => a.type === 'allergy'),
    'Should flag gluten/dairy allergens'
  );
  assert.ok(
    insights.healthierSwaps.length > 0,
    'Should suggest healthier swaps with calories saved'
  );

  return true;
}
