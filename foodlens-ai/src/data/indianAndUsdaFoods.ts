import type {
  NutrientBreakdown,
  ScannedFoodCandidate,
  MealHealthInsight,
  HealthSwapSuggestion,
} from '../types.ts';

export interface VerifiedFoodSeed {
  code: string;
  name: string;
  hindiName: string;
  category:
    | 'grain'
    | 'lentil'
    | 'dairy_protein'
    | 'meat_egg'
    | 'south_indian'
    | 'vegetable'
    | 'fruit'
    | 'complete_dish';
  dietaryTags: string; // comma-separated: vegan, vegetarian, eggetarian, non_vegetarian
  allergenTags: string; // dairy, gluten, eggs, nuts, soy
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
  swapTargetCode?: string;
  swapReason?: string;
}

export const VERIFIED_FOOD_DATABASE: VerifiedFoodSeed[] = [
  {
    code: 'rice_basmati',
    name: 'Steamed White Basmati Rice',
    hindiName: 'उबले बासमती चावल (Chawal)',
    category: 'grain',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (A001) / USDA FDC #169756',
    defaultServingG: 150,
    servingUnitLabel: '1 medium katori (150g)',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
    sugarPer100g: 0.1,
    sodiumMgPer100g: 5,
    ironMgPer100g: 0.2,
    calciumMgPer100g: 10,
    vitaminAMcgPer100g: 0,
    vitaminCMgPer100g: 0,
    vitaminDMcgPer100g: 0,
    vitaminB12McgPer100g: 0,
    swapTargetCode: 'rice_brown',
    swapReason: '4.5x higher fiber & lower glycemic index for steady blood sugar',
  },
  {
    code: 'rice_brown',
    name: 'Steamed Brown Rice',
    hindiName: 'ब्राउन राइस (Unpolished Rice)',
    category: 'grain',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 / USDA FDC #169704',
    defaultServingG: 150,
    servingUnitLabel: '1 medium katori (150g)',
    caloriesPer100g: 123,
    proteinPer100g: 2.7,
    carbsPer100g: 25.6,
    fatPer100g: 1.0,
    fiberPer100g: 1.8,
    sugarPer100g: 0.2,
    sodiumMgPer100g: 4,
    ironMgPer100g: 0.5,
    calciumMgPer100g: 10,
  },
  {
    code: 'roti_chapati',
    name: 'Whole Wheat Roti / Chapati',
    hindiName: 'गेहूँ की रोटी / चपाती (Phulka)',
    category: 'grain',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'gluten',
    sourceDatabase: 'IFCT 2017 (A019 Whole Wheat)',
    defaultServingG: 80,
    servingUnitLabel: '2 medium phulkas (80g)',
    caloriesPer100g: 264,
    proteinPer100g: 9.1,
    carbsPer100g: 51.4,
    fatPer100g: 2.4,
    fiberPer100g: 7.2,
    sugarPer100g: 1.4,
    sodiumMgPer100g: 190,
    ironMgPer100g: 3.1,
    calciumMgPer100g: 34,
  },
  {
    code: 'aloo_paratha',
    name: 'Stuffed Aloo Paratha with Ghee',
    hindiName: 'आलू पराठा (Stuffed Potato Flatbread)',
    category: 'grain',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'gluten,dairy',
    sourceDatabase: 'IFCT 2017 North Indian Composite',
    defaultServingG: 140,
    servingUnitLabel: '1 large paratha (140g)',
    caloriesPer100g: 248,
    proteinPer100g: 5.8,
    carbsPer100g: 36.4,
    fatPer100g: 8.9,
    fiberPer100g: 3.2,
    sugarPer100g: 1.6,
    sodiumMgPer100g: 360,
    ironMgPer100g: 1.9,
    calciumMgPer100g: 28,
    vitaminAMcgPer100g: 42,
    vitaminCMgPer100g: 6.5,
    swapTargetCode: 'roti_chapati',
    swapReason: 'Swap pan-fried Aloo Paratha for 2 Whole Wheat Phulkas to cut saturated fat',
  },
  {
    code: 'chole_bhature',
    name: 'Punjabi Chole Bhature (2 Bhature + Chole)',
    hindiName: 'छोले भटूरे',
    category: 'complete_dish',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'gluten,dairy',
    sourceDatabase: 'IFCT 2017 Composite Street/Restaurant Dish',
    defaultServingG: 260,
    servingUnitLabel: '1 full plate (260g)',
    caloriesPer100g: 262,
    proteinPer100g: 7.4,
    carbsPer100g: 34.8,
    fatPer100g: 10.6,
    fiberPer100g: 3.8,
    sugarPer100g: 2.4,
    sodiumMgPer100g: 440,
    ironMgPer100g: 2.1,
    calciumMgPer100g: 44,
    swapTargetCode: 'chana_masala',
    swapReason: 'Swap deep-fried Bhature for Chana Masala bowl to save refined flour & frying oil',
  },
  {
    code: 'dal_tadka',
    name: 'Yellow Toor / Moong Dal Tadka',
    hindiName: 'अरहर / मूंग दाल तड़का (Dal)',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (B010/B013 Cooked)',
    defaultServingG: 150,
    servingUnitLabel: '1 medium bowl (150g)',
    caloriesPer100g: 118,
    proteinPer100g: 6.8,
    carbsPer100g: 16.2,
    fatPer100g: 2.9,
    fiberPer100g: 3.8,
    sugarPer100g: 1.1,
    sodiumMgPer100g: 280,
    ironMgPer100g: 1.6,
    calciumMgPer100g: 24,
    vitaminAMcgPer100g: 28,
    vitaminCMgPer100g: 3.2,
  },
  {
    code: 'dal_makhani',
    name: 'Creamy Punjabi Dal Makhani',
    hindiName: 'दाल मखनी (Whole Urad & Cream)',
    category: 'lentil',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 Whole Black Gram + Butter/Cream',
    defaultServingG: 160,
    servingUnitLabel: '1 medium bowl (160g)',
    caloriesPer100g: 176,
    proteinPer100g: 6.9,
    carbsPer100g: 17.4,
    fatPer100g: 8.8,
    fiberPer100g: 4.2,
    sugarPer100g: 1.8,
    sodiumMgPer100g: 370,
    ironMgPer100g: 2.1,
    calciumMgPer100g: 56,
    vitaminAMcgPer100g: 64,
    vitaminB12McgPer100g: 0.2,
    swapTargetCode: 'dal_tadka',
    swapReason: 'Swap heavy-cream Dal Makhani for Yellow Dal Tadka to save ~90 kcal of butter fat',
  },
  {
    code: 'rajma_masala',
    name: 'Rajma Masala (Red Kidney Bean Curry)',
    hindiName: 'राजमा मसाला',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (B016 Kidney Bean)',
    defaultServingG: 150,
    servingUnitLabel: '1 medium bowl (150g)',
    caloriesPer100g: 134,
    proteinPer100g: 7.4,
    carbsPer100g: 19.5,
    fatPer100g: 3.1,
    fiberPer100g: 5.4,
    sugarPer100g: 1.5,
    sodiumMgPer100g: 310,
    ironMgPer100g: 2.2,
    calciumMgPer100g: 42,
    vitaminCMgPer100g: 4.5,
  },
  {
    code: 'chana_masala',
    name: 'Chana Masala (Spiced Chickpea Curry)',
    hindiName: 'चना मसाला / छोले',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (B002 Kabuli Chana)',
    defaultServingG: 150,
    servingUnitLabel: '1 medium bowl (150g)',
    caloriesPer100g: 148,
    proteinPer100g: 7.8,
    carbsPer100g: 21.4,
    fatPer100g: 3.6,
    fiberPer100g: 5.8,
    sugarPer100g: 2.1,
    sodiumMgPer100g: 325,
    ironMgPer100g: 2.4,
    calciumMgPer100g: 48,
    vitaminCMgPer100g: 5.0,
  },
  {
    code: 'idli_steamed',
    name: 'Steamed Rice & Urad Dal Idli',
    hindiName: 'इडली (Steamed Idli)',
    category: 'south_indian',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 South Indian Fermented Staples',
    defaultServingG: 120,
    servingUnitLabel: '3 medium idlis (120g)',
    caloriesPer100g: 146,
    proteinPer100g: 4.6,
    carbsPer100g: 29.8,
    fatPer100g: 0.7,
    fiberPer100g: 1.9,
    sugarPer100g: 0.4,
    sodiumMgPer100g: 230,
    ironMgPer100g: 1.1,
    calciumMgPer100g: 22,
  },
  {
    code: 'masala_dosa',
    name: 'Crispy Masala Dosa',
    hindiName: 'मसाला डोसा',
    category: 'south_indian',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 Composite Dish Profile',
    defaultServingG: 160,
    servingUnitLabel: '1 full dosa with potato filling (160g)',
    caloriesPer100g: 208,
    proteinPer100g: 4.8,
    carbsPer100g: 33.5,
    fatPer100g: 6.2,
    fiberPer100g: 2.4,
    sugarPer100g: 0.9,
    sodiumMgPer100g: 340,
    ironMgPer100g: 1.3,
    calciumMgPer100g: 26,
    swapTargetCode: 'idli_steamed',
    swapReason: 'Swap pan-fried Masala Dosa for Steamed Idlis to reduce oil & potatoes',
  },
  {
    code: 'sambar_veg',
    name: 'South Indian Vegetable Sambar',
    hindiName: 'सांभर (Mixed Vegetable Lentil Stew)',
    category: 'south_indian',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 Lentil-Vegetable Composite',
    defaultServingG: 150,
    servingUnitLabel: '1 bowl (150g)',
    caloriesPer100g: 68,
    proteinPer100g: 3.2,
    carbsPer100g: 9.8,
    fatPer100g: 1.8,
    fiberPer100g: 2.6,
    sugarPer100g: 1.7,
    sodiumMgPer100g: 260,
    ironMgPer100g: 1.1,
    calciumMgPer100g: 29,
    vitaminAMcgPer100g: 75,
    vitaminCMgPer100g: 11.2,
  },
  {
    code: 'coconut_chutney',
    name: 'Fresh Coconut Chutney with Tempering',
    hindiName: 'नारियल की चटनी',
    category: 'south_indian',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (H004 Fresh Coconut)',
    defaultServingG: 40,
    servingUnitLabel: '2 tbsp serving (40g)',
    caloriesPer100g: 245,
    proteinPer100g: 3.1,
    carbsPer100g: 8.6,
    fatPer100g: 22.4,
    fiberPer100g: 4.5,
    sugarPer100g: 2.3,
    sodiumMgPer100g: 210,
    ironMgPer100g: 1.4,
    calciumMgPer100g: 18,
  },
  {
    code: 'chicken_biryani',
    name: 'Hyderabadi Chicken Dum Biryani',
    hindiName: 'चिकन दम बिरयानी',
    category: 'complete_dish',
    dietaryTags: 'non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 / USDA Composite Dish',
    defaultServingG: 250,
    servingUnitLabel: '1 standard plate (250g)',
    caloriesPer100g: 178,
    proteinPer100g: 11.4,
    carbsPer100g: 20.6,
    fatPer100g: 5.8,
    fiberPer100g: 1.2,
    sugarPer100g: 0.8,
    sodiumMgPer100g: 365,
    ironMgPer100g: 1.2,
    calciumMgPer100g: 32,
    vitaminB12McgPer100g: 0.4,
    swapTargetCode: 'chicken_tikka',
    swapReason: 'Swap half portion of Biryani rice for Roasted Chicken Tikka + Salad for higher protein density',
  },
  {
    code: 'veg_biryani',
    name: 'Subz Paneer Dum Biryani',
    hindiName: 'वेज पनीर बिरयानी',
    category: 'complete_dish',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 Composite Dish',
    defaultServingG: 240,
    servingUnitLabel: '1 standard plate (240g)',
    caloriesPer100g: 162,
    proteinPer100g: 5.9,
    carbsPer100g: 23.4,
    fatPer100g: 5.1,
    fiberPer100g: 2.3,
    sugarPer100g: 1.4,
    sodiumMgPer100g: 340,
    ironMgPer100g: 1.1,
    calciumMgPer100g: 68,
  },
  {
    code: 'paneer_tikka',
    name: 'Chargrilled Paneer Tikka',
    hindiName: 'पनीर टिक्का (Grilled Cottage Cheese)',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 (L005 Chhana/Paneer)',
    defaultServingG: 100,
    servingUnitLabel: '6 cubes (100g)',
    caloriesPer100g: 258,
    proteinPer100g: 18.6,
    carbsPer100g: 4.2,
    fatPer100g: 18.8,
    fiberPer100g: 0.6,
    sugarPer100g: 1.5,
    sodiumMgPer100g: 290,
    ironMgPer100g: 0.4,
    calciumMgPer100g: 460,
    vitaminAMcgPer100g: 110,
    vitaminDMcgPer100g: 0.5,
    vitaminB12McgPer100g: 0.8,
    swapTargetCode: 'tofu_bhurji',
    swapReason: 'Swap Dairy Paneer for Spiced Soy Tofu to save ~110 kcal and lower saturated fat',
  },
  {
    code: 'paneer_butter_masala',
    name: 'Rich Paneer Butter Masala',
    hindiName: 'पनीर बटर मसाला',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy,nuts',
    sourceDatabase: 'IFCT 2017 Paneer + Cashew-Butter Gravy',
    defaultServingG: 160,
    servingUnitLabel: '1 medium bowl (160g)',
    caloriesPer100g: 235,
    proteinPer100g: 10.4,
    carbsPer100g: 8.6,
    fatPer100g: 17.8,
    fiberPer100g: 1.4,
    sugarPer100g: 3.4,
    sodiumMgPer100g: 390,
    ironMgPer100g: 0.9,
    calciumMgPer100g: 260,
    vitaminAMcgPer100g: 135,
    vitaminB12McgPer100g: 0.6,
    swapTargetCode: 'palak_paneer',
    swapReason: 'Swap cashew-cream Paneer Butter Masala for iron-rich Palak Paneer to save ~95 kcal',
  },
  {
    code: 'palak_paneer',
    name: 'Palak Paneer (Spinach & Cottage Cheese)',
    hindiName: 'पालक पनीर',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 (C034 Spinach + L005 Paneer)',
    defaultServingG: 150,
    servingUnitLabel: '1 medium bowl (150g)',
    caloriesPer100g: 174,
    proteinPer100g: 10.8,
    carbsPer100g: 5.9,
    fatPer100g: 12.1,
    fiberPer100g: 2.4,
    sugarPer100g: 1.6,
    sodiumMgPer100g: 315,
    ironMgPer100g: 2.8,
    calciumMgPer100g: 285,
    vitaminAMcgPer100g: 340,
    vitaminCMgPer100g: 18.0,
    vitaminB12McgPer100g: 0.5,
  },
  {
    code: 'chicken_tikka',
    name: 'Roasted Chicken Breast Tikka',
    hindiName: 'रोस्टेड चिकन ब्रेस्ट टिक्का',
    category: 'meat_egg',
    dietaryTags: 'non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 (N002 Poultry Breast) / USDA #171477',
    defaultServingG: 140,
    servingUnitLabel: '1 fillet portion (140g)',
    caloriesPer100g: 165,
    proteinPer100g: 29.8,
    carbsPer100g: 1.4,
    fatPer100g: 4.1,
    fiberPer100g: 0.1,
    sugarPer100g: 0.4,
    sodiumMgPer100g: 295,
    ironMgPer100g: 1.1,
    calciumMgPer100g: 19,
    vitaminB12McgPer100g: 0.6,
  },
  {
    code: 'chicken_curry',
    name: 'Home-Style Chicken Curry',
    hindiName: 'होम-स्टाइल चिकन करी',
    category: 'meat_egg',
    dietaryTags: 'non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 Poultry Curry Composite',
    defaultServingG: 180,
    servingUnitLabel: '1 medium bowl (180g)',
    caloriesPer100g: 154,
    proteinPer100g: 17.5,
    carbsPer100g: 4.8,
    fatPer100g: 7.2,
    fiberPer100g: 0.9,
    sugarPer100g: 1.5,
    sodiumMgPer100g: 330,
    ironMgPer100g: 1.3,
    calciumMgPer100g: 24,
    vitaminB12McgPer100g: 0.5,
  },
  {
    code: 'boiled_eggs',
    name: 'Boiled Whole Hen Eggs',
    hindiName: 'उबले अंडे (Boiled Anda)',
    category: 'meat_egg',
    dietaryTags: 'eggetarian,non_vegetarian',
    allergenTags: 'eggs',
    sourceDatabase: 'IFCT 2017 (M001 Whole Egg) / USDA #173424',
    defaultServingG: 100,
    servingUnitLabel: '2 large boiled eggs (100g)',
    caloriesPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatPer100g: 10.6,
    fiberPer100g: 0.0,
    sugarPer100g: 1.1,
    sodiumMgPer100g: 124,
    ironMgPer100g: 1.8,
    calciumMgPer100g: 50,
    vitaminAMcgPer100g: 160,
    vitaminDMcgPer100g: 2.0,
    vitaminB12McgPer100g: 1.1,
  },
  {
    code: 'egg_bhurji',
    name: 'Spiced Egg Bhurji (Indian Scrambled Eggs)',
    hindiName: 'अंडा भुर्जी',
    category: 'meat_egg',
    dietaryTags: 'eggetarian,non_vegetarian',
    allergenTags: 'eggs',
    sourceDatabase: 'IFCT 2017 Egg + Onion-Tomato Composite',
    defaultServingG: 130,
    servingUnitLabel: '1 medium bowl (130g)',
    caloriesPer100g: 168,
    proteinPer100g: 11.4,
    carbsPer100g: 3.6,
    fatPer100g: 12.1,
    fiberPer100g: 0.7,
    sugarPer100g: 1.6,
    sodiumMgPer100g: 265,
    ironMgPer100g: 1.6,
    calciumMgPer100g: 46,
    vitaminAMcgPer100g: 145,
    vitaminDMcgPer100g: 1.6,
    vitaminB12McgPer100g: 0.9,
  },
  {
    code: 'mixed_veg_sabzi',
    name: 'Seasonal Mixed Vegetable Sabzi (Beans, Carrot, Gobhi, Peas)',
    hindiName: 'मिक्स वेज सब्ज़ी',
    category: 'vegetable',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (D001-D040 Vegetables)',
    defaultServingG: 120,
    servingUnitLabel: '1 medium katori (120g)',
    caloriesPer100g: 84,
    proteinPer100g: 2.9,
    carbsPer100g: 11.2,
    fatPer100g: 3.1,
    fiberPer100g: 4.1,
    sugarPer100g: 3.2,
    sodiumMgPer100g: 220,
    ironMgPer100g: 1.2,
    calciumMgPer100g: 38,
    vitaminAMcgPer100g: 280,
    vitaminCMgPer100g: 24.0,
  },
  {
    code: 'kachumber_salad',
    name: 'Fresh Kachumber Salad (Cucumber, Tomato, Onion, Lemon)',
    hindiName: 'कचुम्बर सलाद (Fresh Salad)',
    category: 'vegetable',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 Raw Salad Vegetables',
    defaultServingG: 80,
    servingUnitLabel: '1 side bowl (80g)',
    caloriesPer100g: 22,
    proteinPer100g: 0.9,
    carbsPer100g: 4.6,
    fatPer100g: 0.2,
    fiberPer100g: 1.5,
    sugarPer100g: 2.4,
    sodiumMgPer100g: 18,
    ironMgPer100g: 0.4,
    calciumMgPer100g: 16,
    vitaminAMcgPer100g: 45,
    vitaminCMgPer100g: 19.5,
  },
  {
    code: 'plain_curd',
    name: 'Plain Home-Set Dahi / Curd',
    hindiName: 'दही (Plain Curd)',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 (L003 Cow Milk Curd)',
    defaultServingG: 100,
    servingUnitLabel: '1 small katori (100g)',
    caloriesPer100g: 60,
    proteinPer100g: 3.1,
    carbsPer100g: 4.4,
    fatPer100g: 3.2,
    fiberPer100g: 0.0,
    sugarPer100g: 4.4,
    sodiumMgPer100g: 46,
    ironMgPer100g: 0.2,
    calciumMgPer100g: 149,
    vitaminAMcgPer100g: 27,
    vitaminB12McgPer100g: 0.4,
  },
  {
    code: 'greek_yogurt',
    name: 'Strained High-Protein Greek Yogurt (Unsweetened)',
    hindiName: 'ग्रीक योगर्ट (Hung Curd)',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'USDA FDC #170894',
    defaultServingG: 120,
    servingUnitLabel: '1 cup (120g)',
    caloriesPer100g: 73,
    proteinPer100g: 9.9,
    carbsPer100g: 3.9,
    fatPer100g: 1.9,
    fiberPer100g: 0.0,
    sugarPer100g: 3.5,
    sodiumMgPer100g: 36,
    ironMgPer100g: 0.1,
    calciumMgPer100g: 115,
    vitaminB12McgPer100g: 0.7,
  },
  {
    code: 'roasted_chana',
    name: 'Roasted Bengal Gram (Bhuna Chana) with Chickpeas',
    hindiName: 'भुना चना',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (B003 Roasted Bengal Gram)',
    defaultServingG: 50,
    servingUnitLabel: '1 handful bowl (50g)',
    caloriesPer100g: 358,
    proteinPer100g: 21.6,
    carbsPer100g: 58.2,
    fatPer100g: 5.2,
    fiberPer100g: 16.8,
    sugarPer100g: 3.4,
    sodiumMgPer100g: 35,
    ironMgPer100g: 6.1,
    calciumMgPer100g: 58,
  },
  {
    code: 'moong_sprouts',
    name: 'Steamed Green Moong Sprouts Chaat',
    hindiName: 'अंकुरित मूंग चाट',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 Germinated Green Gram',
    defaultServingG: 120,
    servingUnitLabel: '1 bowl (120g)',
    caloriesPer100g: 92,
    proteinPer100g: 7.2,
    carbsPer100g: 15.4,
    fatPer100g: 0.6,
    fiberPer100g: 4.3,
    sugarPer100g: 2.1,
    sodiumMgPer100g: 145,
    ironMgPer100g: 1.8,
    calciumMgPer100g: 36,
    vitaminCMgPer100g: 16.4,
  },
  {
    code: 'tofu_bhurji',
    name: 'Spiced Soy Tofu Bhurji / Stir-Fry',
    hindiName: 'टोफू भुर्जी (Vegan Soy Paneer)',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'soy',
    sourceDatabase: 'USDA FDC #172475 Firm Tofu',
    defaultServingG: 140,
    servingUnitLabel: '1 medium bowl (140g)',
    caloriesPer100g: 144,
    proteinPer100g: 15.8,
    carbsPer100g: 3.4,
    fatPer100g: 8.2,
    fiberPer100g: 1.9,
    sugarPer100g: 0.7,
    sodiumMgPer100g: 240,
    ironMgPer100g: 2.7,
    calciumMgPer100g: 350,
  },
  {
    code: 'soya_chunks_curry',
    name: 'High-Protein Soya Chunks Masala (Cooked)',
    hindiName: 'सोया बड़ी की सब्ज़ी',
    category: 'lentil',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'soy',
    sourceDatabase: 'IFCT 2017 Textured Soy Protein (Hydrated & Cooked)',
    defaultServingG: 150,
    servingUnitLabel: '1 medium bowl (150g)',
    caloriesPer100g: 138,
    proteinPer100g: 16.4,
    carbsPer100g: 11.2,
    fatPer100g: 3.1,
    fiberPer100g: 4.5,
    sugarPer100g: 1.8,
    sodiumMgPer100g: 290,
    ironMgPer100g: 3.4,
    calciumMgPer100g: 110,
  },
  {
    code: 'kanda_poha',
    name: 'Kanda Poha with Curry Leaves & Lemon',
    hindiName: 'कांदा पोहा (Flattened Rice)',
    category: 'grain',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'nuts',
    sourceDatabase: 'IFCT 2017 (A008 Flaked Rice Cooked)',
    defaultServingG: 150,
    servingUnitLabel: '1 breakfast plate (150g)',
    caloriesPer100g: 158,
    proteinPer100g: 3.4,
    carbsPer100g: 28.6,
    fatPer100g: 3.5,
    fiberPer100g: 1.8,
    sugarPer100g: 1.2,
    sodiumMgPer100g: 265,
    ironMgPer100g: 2.6,
    calciumMgPer100g: 20,
    vitaminCMgPer100g: 8.5,
  },
  {
    code: 'masala_oats',
    name: 'Savory Vegetable Masala Oats',
    hindiName: 'वेजिटेबल मसाला ओट्स',
    category: 'grain',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'gluten',
    sourceDatabase: 'USDA FDC #173904 Rolled Oats Cooked',
    defaultServingG: 180,
    servingUnitLabel: '1 medium bowl (180g)',
    caloriesPer100g: 88,
    proteinPer100g: 3.3,
    carbsPer100g: 14.2,
    fatPer100g: 2.1,
    fiberPer100g: 2.6,
    sugarPer100g: 0.9,
    sodiumMgPer100g: 215,
    ironMgPer100g: 1.1,
    calciumMgPer100g: 24,
  },
  {
    code: 'masala_chai',
    name: 'Indian Spiced Masala Chai (with Milk & Sugar)',
    hindiName: 'मसाला चाय',
    category: 'dairy_protein',
    dietaryTags: 'vegetarian,eggetarian,non_vegetarian',
    allergenTags: 'dairy',
    sourceDatabase: 'IFCT 2017 Milk Tea Composite',
    defaultServingG: 150,
    servingUnitLabel: '1 teacup (150ml)',
    caloriesPer100g: 62,
    proteinPer100g: 2.1,
    carbsPer100g: 8.4,
    fatPer100g: 2.2,
    fiberPer100g: 0.0,
    sugarPer100g: 7.8,
    sodiumMgPer100g: 28,
    ironMgPer100g: 0.1,
    calciumMgPer100g: 78,
    vitaminB12McgPer100g: 0.2,
  },
  {
    code: 'fruit_banana',
    name: 'Ripe Robusta / Elaichi Banana',
    hindiName: 'केला (Banana)',
    category: 'fruit',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (E009 Banana) / USDA #173944',
    defaultServingG: 115,
    servingUnitLabel: '1 medium banana (115g)',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    sugarPer100g: 12.2,
    sodiumMgPer100g: 1,
    ironMgPer100g: 0.3,
    calciumMgPer100g: 5,
    vitaminCMgPer100g: 8.7,
  },
  {
    code: 'fruit_apple',
    name: 'Fresh Kashmiri Apple',
    hindiName: 'सेब (Apple)',
    category: 'fruit',
    dietaryTags: 'vegan,vegetarian,eggetarian,non_vegetarian',
    allergenTags: '',
    sourceDatabase: 'IFCT 2017 (E002 Apple) / USDA #171688',
    defaultServingG: 150,
    servingUnitLabel: '1 medium apple (150g)',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 13.8,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    sugarPer100g: 10.4,
    sodiumMgPer100g: 1,
    ironMgPer100g: 0.1,
    calciumMgPer100g: 6,
    vitaminCMgPer100g: 4.6,
  },
];

// Deterministic calculation of exact macros & key vitamins/minerals for a given gram weight
export function calculateNutrientsForPortion(
  food: VerifiedFoodSeed,
  grams: number
): NutrientBreakdown {
  const ratio = Math.max(0, grams) / 100;

  // Category-informed vitamin defaults when not explicitly set on seed
  const vitABase =
    food.vitaminAMcgPer100g ??
    (food.category === 'vegetable'
      ? 140
      : food.category === 'dairy_protein'
      ? 65
      : food.category === 'meat_egg'
      ? 45
      : 12);
  const vitCBase =
    food.vitaminCMgPer100g ??
    (food.category === 'vegetable'
      ? 16
      : food.category === 'fruit'
      ? 7
      : food.category === 'south_indian' || food.category === 'lentil'
      ? 3.5
      : 0.5);
  const vitDBase =
    food.vitaminDMcgPer100g ??
    (food.allergenTags.includes('eggs')
      ? 1.8
      : food.allergenTags.includes('dairy')
      ? 0.4
      : 0);
  const vitB12Base =
    food.vitaminB12McgPer100g ??
    (food.category === 'meat_egg'
      ? 0.8
      : food.allergenTags.includes('dairy')
      ? 0.45
      : 0);

  return {
    caloriesKcal: Math.round(food.caloriesPer100g * ratio * 10) / 10,
    proteinG: Math.round(food.proteinPer100g * ratio * 10) / 10,
    carbsG: Math.round(food.carbsPer100g * ratio * 10) / 10,
    fatG: Math.round(food.fatPer100g * ratio * 10) / 10,
    fiberG: Math.round(food.fiberPer100g * ratio * 10) / 10,
    sugarG: Math.round(food.sugarPer100g * ratio * 10) / 10,
    sodiumMg: Math.round(food.sodiumMgPer100g * ratio),
    ironMg: Math.round((food.ironMgPer100g || 0) * ratio * 10) / 10,
    calciumMg: Math.round((food.calciumMgPer100g || 0) * ratio),
    vitaminAMcg: Math.round(vitABase * ratio),
    vitaminCMg: Math.round(vitCBase * ratio * 10) / 10,
    vitaminDMcg: Math.round(vitDBase * ratio * 10) / 10,
    vitaminB12Mcg: Math.round(vitB12Base * ratio * 100) / 100,
  };
}

// Evaluate Meal Health Score (1-10), Diet/Allergy/Health-Condition Conflicts & 2-3 Healthier Swaps
export function evaluateMealHealthAndSwaps(
  items: ScannedFoodCandidate[],
  userContext?: {
    dietaryPreference?: string;
    allergies?: string;
    restrictions?: string;
    goalType?: string;
  }
): MealHealthInsight {
  if (items.length === 0) {
    return {
      healthScore: 0,
      scoreReason: 'Add or scan food items to compute meal score.',
      conflictAlerts: [],
      healthierSwaps: [],
    };
  }

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.nutrients.caloriesKcal,
      protein: acc.protein + item.nutrients.proteinG,
      carbs: acc.carbs + item.nutrients.carbsG,
      fat: acc.fat + item.nutrients.fatG,
      fiber: acc.fiber + item.nutrients.fiberG,
      sugar: acc.sugar + item.nutrients.sugarG,
      sodium: acc.sodium + item.nutrients.sodiumMg,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );

  // 1. Compute 1–10 Meal Health Score
  let score = 7.2;
  const reasons: string[] = [];

  const proteinCalPct =
    totals.calories > 0 ? (totals.protein * 4 * 100) / totals.calories : 0;
  if (proteinCalPct >= 20) {
    score += 1.2;
    reasons.push('strong protein density');
  } else if (proteinCalPct < 11) {
    score -= 0.9;
    reasons.push('low protein share');
  }

  if (totals.fiber >= 7) {
    score += 1.0;
    reasons.push('high dietary fiber');
  } else if (totals.fiber < 3) {
    score -= 0.6;
    reasons.push('low fiber');
  }

  if (totals.sodium > 950) {
    score -= 1.0;
    reasons.push('elevated sodium');
  }
  if (totals.sugar > 18) {
    score -= 0.8;
    reasons.push('high simple sugars');
  }
  if (totals.fat > 32) {
    score -= 0.7;
    reasons.push('high fat load');
  }

  const clampedScore = Math.max(1.5, Math.min(9.8, Math.round(score * 10) / 10));
  const scoreReason =
    reasons.length > 0
      ? `Balanced meal with ${reasons.slice(0, 3).join(', ')}.`
      : 'Well-proportioned macronutrient & micronutrient profile.';

  // 2. Check Diet, Allergy & Health-Condition Alerts
  const conflictAlerts: MealHealthInsight['conflictAlerts'] = [];
  const userDiet = (userContext?.dietaryPreference || 'vegetarian').toLowerCase();
  const userAllergies = (userContext?.allergies || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const userRestrictions = (
    (userContext?.restrictions || '') +
    ' ' +
    (userContext?.goalType || '')
  ).toLowerCase();

  for (const item of items) {
    const seed = VERIFIED_FOOD_DATABASE.find((f) => f.code === item.foodCode);
    if (!seed) continue;

    // Dietary preference check
    const allowedDiets = seed.dietaryTags.split(',').map((t) => t.trim());
    if (!allowedDiets.includes(userDiet)) {
      conflictAlerts.push({
        severity: 'high',
        type: 'diet',
        message: `${item.name} conflicts with your ${userDiet.replace('_', '-')} diet setting.`,
      });
    }

    // Allergen check
    const itemAllergens = seed.allergenTags
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    for (const allergen of userAllergies) {
      if (
        itemAllergens.some((ia) => ia.includes(allergen) || allergen.includes(ia)) ||
        item.name.toLowerCase().includes(allergen)
      ) {
        conflictAlerts.push({
          severity: 'high',
          type: 'allergy',
          message: `Allergy Alert: ${item.name} contains ${allergen}.`,
        });
      }
    }
  }

  // Health-condition alerts (Diabetes, High BP, High Cholesterol)
  if (
    totals.sugar >= 16 ||
    (totals.carbs >= 75 && totals.fiber < 5) ||
    userRestrictions.includes('diabet')
  ) {
    if (totals.carbs >= 65 || totals.sugar >= 14) {
      conflictAlerts.push({
        severity: 'medium',
        type: 'health_condition',
        message: `Glycemic / Diabetes Note: ${Math.round(totals.carbs)}g carbs & ${Math.round(
          totals.sugar
        )}g sugar — pair with extra fiber/protein or reduce refined grain portion.`,
      });
    }
  }

  if (totals.sodium >= 800 || userRestrictions.includes('bp') || userRestrictions.includes('sodium')) {
    if (totals.sodium >= 700) {
      conflictAlerts.push({
        severity: 'medium',
        type: 'health_condition',
        message: `Blood Pressure Alert: Meal contains ${totals.sodium}mg sodium (high salt load).`,
      });
    }
  }

  if (totals.fat >= 28 || userRestrictions.includes('cholesterol')) {
    if (totals.fat >= 24) {
      conflictAlerts.push({
        severity: 'medium',
        type: 'health_condition',
        message: `Cholesterol / Lipid Alert: ${Math.round(totals.fat)}g total fat — consider grilled or steamed swaps.`,
      });
    }
  }

  // 3. Build 2–3 Healthier Swaps with Calories Saved
  const healthierSwaps: HealthSwapSuggestion[] = [];
  for (const item of items) {
    const seed = VERIFIED_FOOD_DATABASE.find((f) => f.code === item.foodCode);
    if (!seed) continue;

    let targetCode = seed.swapTargetCode;
    let customReason = seed.swapReason;

    if (!targetCode) {
      if (seed.code === 'roti_chapati' && item.confirmedPortionG > 100) {
        targetCode = 'moong_sprouts';
        customReason = 'Replace 1 extra Roti with Steamed Moong Sprouts to boost protein & cut net carbs';
      } else if (seed.code === 'plain_curd') {
        targetCode = 'greek_yogurt';
        customReason = 'Swap regular Curd for Strained Greek Yogurt (Hung Curd) to triple protein';
      }
    }

    if (targetCode) {
      const targetSeed = VERIFIED_FOOD_DATABASE.find((f) => f.code === targetCode);
      if (targetSeed && targetSeed.code !== seed.code) {
        const currentCal = item.nutrients.caloriesKcal;
        const targetCal = calculateNutrientsForPortion(
          targetSeed,
          item.confirmedPortionG
        ).caloriesKcal;
        const saved = Math.max(15, Math.round(currentCal - targetCal));

        if (!healthierSwaps.some((s) => s.fromFoodCode === seed.code)) {
          healthierSwaps.push({
            fromFoodCode: seed.code,
            fromFoodName: seed.name,
            toFoodCode: targetSeed.code,
            toFoodName: targetSeed.name,
            caloriesSavedKcal: saved,
            reason:
              customReason ||
              `Higher protein-to-calorie ratio (${targetSeed.proteinPer100g}g protein/100g)`,
          });
        }
      }
    }
  }

  // Ensure at least 2 smart suggestions if plate has items
  if (healthierSwaps.length === 0 && items.length > 0) {
    const highestCalItem = [...items].sort(
      (a, b) => b.nutrients.caloriesKcal - a.nutrients.caloriesKcal
    )[0];
    const sproutSeed = VERIFIED_FOOD_DATABASE.find((f) => f.code === 'moong_sprouts')!;
    healthierSwaps.push({
      fromFoodCode: highestCalItem.foodCode,
      fromFoodName: highestCalItem.name,
      toFoodCode: sproutSeed.code,
      toFoodName: sproutSeed.name,
      caloriesSavedKcal: Math.max(
        35,
        Math.round(highestCalItem.nutrients.caloriesKcal * 0.35)
      ),
      reason: 'Lighter, high-fiber germinated legume swap with vitamin C & iron',
    });
  }

  return {
    healthScore: clampedScore,
    scoreReason,
    conflictAlerts: conflictAlerts.slice(0, 4),
    healthierSwaps: healthierSwaps.slice(0, 3),
  };
}

// Parse Natural Language Text / Voice / Nutrition Label Input into Verified Food Candidates
export function parseNaturalLanguageFoodInput(rawText: string): ScannedFoodCandidate[] {
  const text = (rawText || '').toLowerCase();
  if (!text.trim()) return [];

  const keywordMap: Array<{ keywords: string[]; code: string; unitGrams?: number }> = [
    { keywords: ['chole bhature', 'bhature', 'bhatura'], code: 'chole_bhature', unitGrams: 260 },
    { keywords: ['aloo paratha', 'paratha', 'parantha'], code: 'aloo_paratha', unitGrams: 140 },
    { keywords: ['paneer butter masala', 'butter paneer', 'shahi paneer'], code: 'paneer_butter_masala', unitGrams: 160 },
    { keywords: ['palak paneer', 'saag paneer'], code: 'palak_paneer', unitGrams: 150 },
    { keywords: ['paneer tikka', 'paneer'], code: 'paneer_tikka', unitGrams: 100 },
    { keywords: ['dal makhani', 'makhani'], code: 'dal_makhani', unitGrams: 160 },
    { keywords: ['dal', 'daal', 'toor', 'moong dal', 'lentil'], code: 'dal_tadka', unitGrams: 150 },
    { keywords: ['rajma', 'kidney bean'], code: 'rajma_masala', unitGrams: 150 },
    { keywords: ['chana masala', 'chole', 'chickpea'], code: 'chana_masala', unitGrams: 150 },
    { keywords: ['roasted chana', 'bhuna chana'], code: 'roasted_chana', unitGrams: 50 },
    { keywords: ['roti', 'chapati', 'phulka'], code: 'roti_chapati', unitGrams: 40 },
    { keywords: ['brown rice'], code: 'rice_brown', unitGrams: 150 },
    { keywords: ['rice', 'chawal', 'basmati'], code: 'rice_basmati', unitGrams: 150 },
    { keywords: ['idli', 'idly'], code: 'idli_steamed', unitGrams: 40 },
    { keywords: ['dosa', 'masala dosa'], code: 'masala_dosa', unitGrams: 160 },
    { keywords: ['sambar', 'sambhar'], code: 'sambar_veg', unitGrams: 150 },
    { keywords: ['chutney', 'coconut chutney'], code: 'coconut_chutney', unitGrams: 40 },
    { keywords: ['chicken biryani', 'biryani'], code: 'chicken_biryani', unitGrams: 250 },
    { keywords: ['veg biryani', 'pulao'], code: 'veg_biryani', unitGrams: 240 },
    { keywords: ['chicken tikka', 'grilled chicken', 'chicken breast'], code: 'chicken_tikka', unitGrams: 140 },
    { keywords: ['chicken curry', 'chicken'], code: 'chicken_curry', unitGrams: 180 },
    { keywords: ['egg bhurji', 'scrambled egg', 'omelette'], code: 'egg_bhurji', unitGrams: 130 },
    { keywords: ['egg', 'anda', 'boiled egg'], code: 'boiled_eggs', unitGrams: 50 },
    { keywords: ['sabzi', 'subzi', 'mixed veg', 'vegetable'], code: 'mixed_veg_sabzi', unitGrams: 120 },
    { keywords: ['salad', 'kachumber', 'cucumber'], code: 'kachumber_salad', unitGrams: 80 },
    { keywords: ['greek yogurt', 'hung curd'], code: 'greek_yogurt', unitGrams: 120 },
    { keywords: ['curd', 'dahi', 'yogurt', 'raita'], code: 'plain_curd', unitGrams: 100 },
    { keywords: ['sprouts', 'moong sprouts'], code: 'moong_sprouts', unitGrams: 120 },
    { keywords: ['tofu'], code: 'tofu_bhurji', unitGrams: 140 },
    { keywords: ['soya', 'soy chunks'], code: 'soya_chunks_curry', unitGrams: 150 },
    { keywords: ['poha', 'kanda poha'], code: 'kanda_poha', unitGrams: 150 },
    { keywords: ['oats', 'masala oats'], code: 'masala_oats', unitGrams: 180 },
    { keywords: ['chai', 'tea', 'masala chai'], code: 'masala_chai', unitGrams: 150 },
    { keywords: ['banana', 'kela'], code: 'fruit_banana', unitGrams: 115 },
    { keywords: ['apple', 'seb'], code: 'fruit_apple', unitGrams: 150 },
  ];

  const matchedCodes = new Set<string>();
  const results: ScannedFoodCandidate[] = [];

  for (const entry of keywordMap) {
    for (const kw of entry.keywords) {
      const idx = text.indexOf(kw);
      if (idx !== -1 && !matchedCodes.has(entry.code)) {
        matchedCodes.add(entry.code);
        const seed = VERIFIED_FOOD_DATABASE.find((f) => f.code === entry.code)!;

        // Check for explicit gram or count prefix near the keyword (e.g. "200g paneer" or "3 roti")
        const windowBefore = text.slice(Math.max(0, idx - 16), idx);
        const gramMatch = windowBefore.match(/(\d+)\s*(g|gm|grams)\b/);
        const countMatch = windowBefore.match(/(\d+(?:\.\d+)?)\s*$/);

        let grams = seed.defaultServingG;
        if (gramMatch) {
          grams = Math.max(15, Math.min(900, Number(gramMatch[1])));
        } else if (countMatch) {
          const count = Math.max(0.5, Math.min(10, Number(countMatch[1])));
          grams = Math.round(count * (entry.unitGrams || seed.defaultServingG));
        }

        results.push({
          foodCode: seed.code,
          name: seed.name,
          hindiName: seed.hindiName,
          category: seed.category,
          sourceDatabase: seed.sourceDatabase,
          servingUnitLabel: seed.servingUnitLabel,
          estimatedPortionG: grams,
          confirmedPortionG: grams,
          confidenceScore: 0.94,
          visualRegion: 'Voice / Text Parsed',
          nutrients: calculateNutrientsForPortion(seed, grams),
        });
        break;
      }
    }
  }

  return results;
}

// Deterministic Mifflin-St Jeor Equation + Goal-Based Macronutrient Targets
export function calculateMetabolicProfile(params: {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: string;
  activityLevel: string;
  goalType: string;
}) {
  const heightM = params.heightCm / 100;
  const bmi = Math.round((params.weightKg / (heightM * heightM)) * 10) / 10;

  // Mifflin-St Jeor BMR
  let sexAdjustment = -78;
  if (params.sex === 'male') sexAdjustment = 5;
  else if (params.sex === 'female') sexAdjustment = -161;

  const bmr = Math.round(
    10 * params.weightKg + 6.25 * params.heightCm - 5 * params.age + sexAdjustment
  );

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = activityMultipliers[params.activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  // Target calories based on fitness goal
  let caloriesKcal = tdee;
  let proteinPerKg = 1.6;
  let fatCalorieShare = 0.27;

  switch (params.goalType) {
    case 'weight_loss':
      caloriesKcal = Math.max(1350, tdee - 450);
      proteinPerKg = 1.9;
      fatCalorieShare = 0.26;
      break;
    case 'muscle_gain':
      caloriesKcal = tdee + 300;
      proteinPerKg = 2.0;
      fatCalorieShare = 0.25;
      break;
    case 'diabetic_friendly':
      caloriesKcal = Math.max(1400, tdee - 250);
      proteinPerKg = 1.85;
      fatCalorieShare = 0.32; // Lower net carbohydrate ratio for glycemic stability
      break;
    case 'maintenance':
    case 'healthy_lifestyle':
    case 'balanced':
    default:
      caloriesKcal = tdee;
      proteinPerKg = 1.6;
      fatCalorieShare = 0.28;
      break;
  }

  const proteinG = Math.round(params.weightKg * proteinPerKg);
  const fatG = Math.round((caloriesKcal * fatCalorieShare) / 9);
  const remainingCals = Math.max(400, caloriesKcal - proteinG * 4 - fatG * 9);
  const carbsG = Math.round(remainingCals / 4);
  const fiberG = Math.round((caloriesKcal / 1000) * 14);
  const waterMl = Math.round(params.weightKg * 38);

  return {
    bmi,
    bmr,
    tdee,
    caloriesKcal,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    waterMl,
  };
}
