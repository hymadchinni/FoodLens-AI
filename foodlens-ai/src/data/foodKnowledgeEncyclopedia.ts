/**
 * Comprehensive Food Knowledge Encyclopedia (IFCT 2017 & USDA FoodData Central)
 * Provides instant, detailed nutrition & micronutrient breakdowns for Indian & global foods.
 */

export interface FoodKnowledgeEntry {
  id: string;
  names: string[]; // English, Hindi, Hinglish synonyms
  displayName: string;
  servingLabel: string;
  defaultGrams: number;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodiumMg: number;
  };
  containsDetails: string;
  vitaminsAndMinerals: string;
  healthBenefitAndTip: string;
}

export const FOOD_KNOWLEDGE_ENCYCLOPEDIA: FoodKnowledgeEntry[] = [
  {
    id: 'aloo_potato',
    names: ['aloo', 'alu', 'potato', 'potatoes', 'ubla aloo', 'boiled potato', 'आलू'],
    displayName: 'Aloo / Potato (Boiled, Edible Portion)',
    servingLabel: '1 medium potato (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 87,
      protein: 1.9,
      carbs: 20.1,
      fat: 0.1,
      fiber: 1.8,
      sugar: 0.9,
      sodiumMg: 16,
    },
    containsDetails:
      'Starch complex carbohydrates, water (77%), plant amino acids, and resistant starch (when cooled after boiling).',
    vitaminsAndMinerals:
      'Potassium (379mg), Vitamin C (13mg), Vitamin B6 (0.3mg), Magnesium (22mg), Iron (0.3mg), Phosphorus.',
    healthBenefitAndTip:
      'Aloo is naturally fat-free and rich in potassium for blood pressure support. Boil or air-fry instead of deep-frying, and pair with curd, dal, or paneer to add protein and slow blood sugar rise.',
  },
  {
    id: 'sweet_potato',
    names: ['shakarkandi', 'sweet potato', 'shakarkand', 'शकरकंदी'],
    displayName: 'Shakarkandi / Sweet Potato (Boiled)',
    servingLabel: '1 medium sweet potato (130g)',
    defaultGrams: 130,
    per100g: {
      calories: 86,
      protein: 1.6,
      carbs: 20.1,
      fat: 0.1,
      fiber: 3.0,
      sugar: 4.2,
      sodiumMg: 55,
    },
    containsDetails:
      'Slow-digesting complex carbs, beta-carotene antioxidants, and soluble dietary fiber.',
    vitaminsAndMinerals:
      'Vitamin A (709µg — over 90% daily value), Vitamin C (12.8mg), Potassium (337mg), Manganese, Vitamin B6.',
    healthBenefitAndTip:
      'Excellent for eye health, immunity, and sustained energy with a lower glycemic impact than white potato.',
  },
  {
    id: 'paneer',
    names: ['paneer', 'cottage cheese', 'chhena', 'paneer tikka', 'पनीर'],
    displayName: 'Paneer / Indian Cottage Cheese',
    servingLabel: '1 standard bowl / 6 cubes (100g)',
    defaultGrams: 100,
    per100g: {
      calories: 258,
      protein: 18.6,
      carbs: 4.2,
      fat: 18.8,
      fiber: 0.2,
      sugar: 1.5,
      sodiumMg: 290,
    },
    containsDetails:
      'Complete slow-digesting casein milk protein, all 9 essential amino acids, and healthy dairy fats.',
    vitaminsAndMinerals:
      'Calcium (460mg), Phosphorus (330mg), Vitamin B12 (0.8µg), Vitamin A (110µg), Vitamin D, Selenium.',
    healthBenefitAndTip:
      'One of the best vegetarian muscle-building and bone-strengthening foods. Grill or add to spinach (Palak Paneer) instead of heavy butter/cream gravies.',
  },
  {
    id: 'egg',
    names: ['egg', 'eggs', 'anda', 'ande', 'boiled egg', 'omelette', 'अंडा'],
    displayName: 'Whole Hen Egg (Boiled)',
    servingLabel: '2 large eggs (100g · ~6.3g protein per egg)',
    defaultGrams: 100,
    per100g: {
      calories: 155,
      protein: 12.6,
      carbs: 1.1,
      fat: 10.6,
      fiber: 0.0,
      sugar: 1.1,
      sodiumMg: 124,
    },
    containsDetails:
      '100% bioavailable complete protein (egg white albumin + nutrient-dense yolk with healthy phospholipids).',
    vitaminsAndMinerals:
      'Vitamin B12 (1.1µg), Vitamin D (2.0µg), Choline (294mg for brain health), Iron (1.8mg), Vitamin A (160µg), Selenium, Lutein.',
    healthBenefitAndTip:
      '1 large egg (50g) has 78 kcal and 6.3g protein. Eat boiled or as spiced Egg Bhurji with vegetables for high satiety.',
  },
  {
    id: 'chicken_breast',
    names: ['chicken', 'chicken breast', 'chicken tikka', 'chicken curry', 'murgh', 'चिकन'],
    displayName: 'Chicken Breast (Roasted / Grilled)',
    servingLabel: '1 medium fillet portion (140g)',
    defaultGrams: 140,
    per100g: {
      calories: 165,
      protein: 29.8,
      carbs: 1.4,
      fat: 4.1,
      fiber: 0.0,
      sugar: 0.4,
      sodiumMg: 295,
    },
    containsDetails:
      'Ultra-lean complete animal protein rich in leucine and branched-chain amino acids (BCAAs).',
    vitaminsAndMinerals:
      'Vitamin B3 / Niacin (13.7mg), Vitamin B6 (0.6mg), Vitamin B12 (0.6µg), Phosphorus (228mg), Zinc, Iron (1.1mg).',
    healthBenefitAndTip:
      'Ideal for fat loss and muscle gain because nearly 75% of its calories come pure from protein.',
  },
  {
    id: 'dal',
    names: ['dal', 'daal', 'toor dal', 'moong dal', 'masoor dal', 'arhar dal', 'lentils', 'दाल'],
    displayName: 'Cooked Yellow Dal (Toor / Moong Dal Tadka)',
    servingLabel: '1 medium bowl (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 118,
      protein: 6.8,
      carbs: 16.2,
      fat: 2.9,
      fiber: 3.8,
      sugar: 1.1,
      sodiumMg: 280,
    },
    containsDetails:
      'Plant legume protein, soluble & insoluble prebiotic fiber, and complex slow-release carbohydrates.',
    vitaminsAndMinerals:
      'Folate / Vitamin B9 (90µg), Iron (1.6mg), Potassium (260mg), Magnesium (36mg), Zinc, Manganese.',
    healthBenefitAndTip:
      'Combine dal with rice or whole wheat roti to form a complete amino acid profile. Squeeze fresh lemon on top to boost iron absorption.',
  },
  {
    id: 'chana',
    names: ['chana', 'chickpea', 'chickpeas', 'chole', 'roasted chana', 'bhuna chana', 'kala chana', 'चना', 'छोले'],
    displayName: 'Chana / Chickpeas (Cooked Chole & Roasted Chana)',
    servingLabel: '1 bowl cooked Chana (150g) or 50g Roasted Chana',
    defaultGrams: 150,
    per100g: {
      calories: 148,
      protein: 7.8,
      carbs: 21.4,
      fat: 3.6,
      fiber: 5.8,
      sugar: 2.1,
      sodiumMg: 325,
    },
    containsDetails:
      'High plant protein, soluble fiber, and low-glycemic complex carbs (Dry Roasted Chana has 21.6g protein & 16.8g fiber per 100g!).',
    vitaminsAndMinerals:
      'Iron (2.4mg–6.1mg), Folate, Calcium (48mg), Magnesium, Phosphorus, Zinc.',
    healthBenefitAndTip:
      'Keeps blood sugar stable and prevents hunger cravings for hours. Roasted chana is one of the best high-protein Indian evening snacks.',
  },
  {
    id: 'rajma',
    names: ['rajma', 'kidney beans', 'rajma chawal', 'राजमा'],
    displayName: 'Rajma / Red Kidney Bean Curry',
    servingLabel: '1 medium bowl (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 134,
      protein: 7.4,
      carbs: 19.5,
      fat: 3.1,
      fiber: 5.4,
      sugar: 1.5,
      sodiumMg: 310,
    },
    containsDetails:
      'Phaseolamin-containing kidney beans rich in plant protein, anthocyanin antioxidants, and soluble fiber.',
    vitaminsAndMinerals:
      'Iron (2.2mg), Potassium (340mg), Folate, Calcium (42mg), Magnesium, Vitamin K.',
    healthBenefitAndTip:
      'Supports heart health and steady glucose levels. Pair 1 bowl Rajma with 120g rice and cucumber salad.',
  },
  {
    id: 'soya_chunks',
    names: ['soya', 'soy chunks', 'soya chunks', 'nutrela', 'soya badi', 'meal maker', 'सोया'],
    displayName: 'Soya Chunks (Dry vs Cooked Masala)',
    servingLabel: '1 bowl cooked Soya Chunks (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 138,
      protein: 16.4,
      carbs: 11.2,
      fat: 3.1,
      fiber: 4.5,
      sugar: 1.8,
      sodiumMg: 290,
    },
    containsDetails:
      'Textured plant soy protein containing all 9 essential amino acids (100g raw dry soya chunks contain 52g protein & 345 kcal).',
    vitaminsAndMinerals:
      'Iron (3.4mg), Calcium (110mg), Isoflavones, Magnesium, Phosphorus, B-Vitamins.',
    healthBenefitAndTip:
      'The highest protein-per-rupee vegetarian food in India. Boil in salted water, squeeze out excess water, and sauté with vegetables.',
  },
  {
    id: 'rice',
    names: ['rice', 'chawal', 'basmati rice', 'white rice', 'brown rice', 'चावल'],
    displayName: 'Steamed Basmati Rice (Cooked)',
    servingLabel: '1 medium katori (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28.2,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      sodiumMg: 5,
    },
    containsDetails:
      'Easily digestible starch carbohydrates, zero cholesterol, and gluten-free energy.',
    vitaminsAndMinerals:
      'Manganese, Selenium, Folate, Thiamine (Vitamin B1), Niacin (Vitamin B3). (Brown rice adds 1.8g fiber & magnesium).',
    healthBenefitAndTip:
      'Rice is not fattening when portioned (1 katori = 195 kcal). Always eat rice with dal, curd, paneer, or chicken plus salad to lower its glycemic index.',
  },
  {
    id: 'roti',
    names: ['roti', 'chapati', 'phulka', 'wheat roti', 'atta roti', 'रोटी', 'चपाती'],
    displayName: 'Whole Wheat Roti / Phulka',
    servingLabel: '2 medium phulkas (80g · ~105 kcal per roti)',
    defaultGrams: 80,
    per100g: {
      calories: 264,
      protein: 9.1,
      carbs: 51.4,
      fat: 2.4,
      fiber: 7.2,
      sugar: 1.4,
      sodiumMg: 190,
    },
    containsDetails:
      'Whole-grain wheat complex carbohydrates, wheat bran dietary fiber, and plant gluten protein.',
    vitaminsAndMinerals:
      'Iron (3.1mg), Magnesium (82mg), Phosphorus, Zinc, Vitamin B1, B3, and B6.',
    healthBenefitAndTip:
      '1 medium phulka (40g) has ~105 kcal, 3.6g protein, and 2.9g fiber. High fiber keeps blood sugar steady and supports digestion.',
  },
  {
    id: 'curd_dahi',
    names: ['curd', 'dahi', 'yogurt', 'greek yogurt', 'raita', 'buttermilk', 'chaas', 'lassi', 'दही'],
    displayName: 'Plain Home-Set Curd / Dahi',
    servingLabel: '1 bowl (100g)',
    defaultGrams: 100,
    per100g: {
      calories: 60,
      protein: 3.1,
      carbs: 4.4,
      fat: 3.2,
      fiber: 0.0,
      sugar: 4.4,
      sodiumMg: 46,
    },
    containsDetails:
      'Live probiotic lactic acid bacteria, easily digestible whey & casein milk proteins, and natural lactose.',
    vitaminsAndMinerals:
      'Calcium (149mg), Vitamin B12 (0.4µg), Riboflavin (Vitamin B2), Phosphorus (110mg), Potassium.',
    healthBenefitAndTip:
      'Improves gut microbiome, digestion, and calcium absorption. Strained Greek Yogurt / Hung Curd boosts protein to 9.9g per 100g.',
  },
  {
    id: 'milk',
    names: ['milk', 'doodh', 'cow milk', 'buffalo milk', 'दूध'],
    displayName: 'Toned Cow Milk',
    servingLabel: '1 glass (250ml)',
    defaultGrams: 250,
    per100g: {
      calories: 62,
      protein: 3.3,
      carbs: 4.8,
      fat: 3.2,
      fiber: 0.0,
      sugar: 4.8,
      sodiumMg: 44,
    },
    containsDetails:
      'Complete dairy protein (80% casein, 20% whey), electrolytes, and bone-building minerals.',
    vitaminsAndMinerals:
      'Calcium (120mg/100ml), Vitamin B12 (0.45µg), Vitamin D, Vitamin A, Potassium, Phosphorus.',
    healthBenefitAndTip:
      '1 glass (250ml) provides ~155 kcal, 8.2g complete protein, and 300mg calcium.',
  },
  {
    id: 'banana',
    names: ['banana', 'kela', 'bananas', 'केला'],
    displayName: 'Ripe Banana (Kela)',
    servingLabel: '1 medium banana (115g)',
    defaultGrams: 115,
    per100g: {
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      sodiumMg: 1,
    },
    containsDetails:
      'Quick-energy natural fruit sugars (glucose, fructose), pectin fiber, and prebiotic starch.',
    vitaminsAndMinerals:
      'Potassium (358mg), Vitamin B6 (0.4mg), Vitamin C (8.7mg), Magnesium (27mg).',
    healthBenefitAndTip:
      '1 medium banana has ~102 kcal. Great pre-workout or morning energy booster that prevents muscle cramps.',
  },
  {
    id: 'apple',
    names: ['apple', 'seb', 'apples', 'सेब'],
    displayName: 'Fresh Apple (with Skin)',
    servingLabel: '1 medium apple (150g)',
    defaultGrams: 150,
    per100g: {
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      sodiumMg: 1,
    },
    containsDetails:
      'Soluble pectin fiber, high water content (86%), and quercetin polyphenol antioxidants.',
    vitaminsAndMinerals:
      'Vitamin C (4.6mg), Potassium (107mg), Vitamin K, Boron.',
    healthBenefitAndTip:
      'Low-calorie, high-satiety fruit (~78 kcal per apple) ideal for weight loss and heart health. Eat with the skin on for maximum fiber.',
  },
  {
    id: 'oats',
    names: ['oats', 'oatmeal', 'masala oats', 'rolled oats', 'ओट्स'],
    displayName: 'Oats (Cooked Masala Oats / Rolled Oats)',
    servingLabel: '1 medium bowl cooked (180g) or 50g dry oats',
    defaultGrams: 180,
    per100g: {
      calories: 88,
      protein: 3.3,
      carbs: 14.2,
      fat: 2.1,
      fiber: 2.6,
      sugar: 0.9,
      sodiumMg: 215,
    },
    containsDetails:
      'Whole-grain complex carbs and heart-healthy Beta-Glucan soluble fiber (50g dry rolled oats have 190 kcal, 6.5g protein & 5g fiber).',
    vitaminsAndMinerals:
      'Manganese, Phosphorus, Magnesium, Iron (1.1mg), Zinc, B-Vitamins.',
    healthBenefitAndTip:
      'Beta-glucan fiber lowers bad LDL cholesterol and keeps blood sugar stable all morning.',
  },
  {
    id: 'almonds_nuts',
    names: ['almond', 'almonds', 'badam', 'peanuts', 'moongphali', 'walnut', 'akhrot', 'cashew', 'kaju', 'nuts', 'बादाम', 'मूंगफली'],
    displayName: 'Almonds / Badam & Peanuts (Nuts & Seeds)',
    servingLabel: '1 small handful (28g / ~20 almonds)',
    defaultGrams: 28,
    per100g: {
      calories: 579,
      protein: 21.2,
      carbs: 21.6,
      fat: 49.9,
      fiber: 12.5,
      sugar: 4.4,
      sodiumMg: 1,
    },
    containsDetails:
      'Heart-healthy monounsaturated fats, plant protein, and antioxidant Vitamin E.',
    vitaminsAndMinerals:
      'Vitamin E (25.6mg), Magnesium (270mg), Calcium (269mg), Iron (3.7mg), Zinc, Biotin.',
    healthBenefitAndTip:
      'A 28g handful (~20 almonds or peanuts) gives 162 kcal, 6g protein, and 3.5g fiber. Soak almonds overnight for easier digestion.',
  },
  {
    id: 'palak_spinach',
    names: ['palak', 'spinach', 'saag', 'palak paneer', 'green leafy', 'पालक'],
    displayName: 'Palak / Fresh Spinach Leaves',
    servingLabel: '1 bowl cooked palak (120g)',
    defaultGrams: 120,
    per100g: {
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      sodiumMg: 79,
    },
    containsDetails:
      'Low-calorie leafy green packed with chlorophyll, lutein, zeaxanthin, and insoluble fiber.',
    vitaminsAndMinerals:
      'Vitamin K (483µg), Vitamin A (469µg), Folate (194µg), Vitamin C (28mg), Iron (2.7mg), Calcium (99mg), Magnesium.',
    healthBenefitAndTip:
      'Extremely nutrient-dense with almost no calories. Pair with lemon or tomatoes (Vitamin C) to double iron absorption.',
  },
  {
    id: 'idli_dosa',
    names: ['idli', 'dosa', 'masala dosa', 'uttapam', 'sambar', 'इडली', 'डोसा'],
    displayName: 'Steamed Idli & Masala Dosa (Fermented Rice-Lentil)',
    servingLabel: '3 medium Idlis (120g) or 1 Masala Dosa (160g)',
    defaultGrams: 120,
    per100g: {
      calories: 146,
      protein: 4.6,
      carbs: 29.8,
      fat: 0.7,
      fiber: 1.9,
      sugar: 0.4,
      sodiumMg: 230,
    },
    containsDetails:
      'Fermented parboiled rice and black gram (urad dal) providing complementary amino acids and gut-friendly bioavailability.',
    vitaminsAndMinerals:
      'B-Vitamins (enhanced by fermentation), Iron (1.1mg), Calcium (22mg), Potassium.',
    healthBenefitAndTip:
      '3 Steamed Idlis have only ~175 kcal and 5.5g protein with almost zero fat. Pair with a generous bowl of Sambar or chutney for extra protein and fiber.',
  },
  {
    id: 'biryani',
    names: ['biryani', 'chicken biryani', 'veg biryani', 'mutton biryani', 'pulao', 'बिरयानी'],
    displayName: 'Hyderabadi Dum Biryani (Chicken / Veg)',
    servingLabel: '1 standard plate (250g)',
    defaultGrams: 250,
    per100g: {
      calories: 178,
      protein: 11.4,
      carbs: 20.6,
      fat: 5.8,
      fiber: 1.2,
      sugar: 0.8,
      sodiumMg: 365,
    },
    containsDetails:
      'Aged basmati rice slow-cooked with marinated chicken/paneer, saffron, whole spices, herbs, and caramelized onions.',
    vitaminsAndMinerals:
      'Vitamin B12 (0.4µg), Iron (1.2mg), Zinc, Niacin, Calcium (32mg).',
    healthBenefitAndTip:
      '1 plate (250g) Chicken Biryani provides ~445 kcal and 28.5g protein. Ask for extra chicken/paneer pieces and pair with plain curd raita instead of heavy salan.',
  },
  {
    id: 'samosa_snacks',
    names: ['samosa', 'kachori', 'pakora', 'bhature', 'chole bhature', 'vada pav', 'समोसा'],
    displayName: 'Crispy Punjabi Samosa (Spiced Potato & Pea Pastry)',
    servingLabel: '1 medium samosa (80g)',
    defaultGrams: 80,
    per100g: {
      calories: 308,
      protein: 5.4,
      carbs: 32.2,
      fat: 17.4,
      fiber: 2.1,
      sugar: 1.6,
      sodiumMg: 420,
    },
    containsDetails:
      'Refined wheat pastry crust (maida), spiced mashed potato & green peas, deep-fried in vegetable oil.',
    vitaminsAndMinerals:
      'Potassium (180mg), Vitamin C (4mg), Iron (1.4mg), Sodium (420mg).',
    healthBenefitAndTip:
      '1 medium samosa (80g) has ~246 kcal and 14g fat. Enjoy occasionally or bake/air-fry at home to save ~100 kcal per piece.',
  },
];

/**
 * Instantly checks if a user question is asking about a specific food item
 * (e.g., "how much protein in aloo", "what does paneer contain", "200g chicken")
 * and returns a clear, detailed, well-structured food knowledge response.
 */
export function lookupFoodKnowledgeQuery(question: string): string | null {
  const q = question.toLowerCase().trim();

  // Check if user specified a custom gram weight or count (e.g. "200g aloo" or "3 eggs")
  const gramMatch = q.match(/(\d+)\s*(g|gm|grams)\b/);

  for (const entry of FOOD_KNOWLEDGE_ENCYCLOPEDIA) {
    const matched = entry.names.some((syn) => {
      const regex = new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(q) || q.includes(syn);
    });

    if (matched) {
      const targetGrams = gramMatch
        ? Math.max(10, Math.min(1000, Number(gramMatch[1])))
        : 100;
      const ratio = targetGrams / 100;
      const servingRatio = entry.defaultGrams / 100;

      const cal = Math.round(entry.per100g.calories * ratio);
      const prot = Math.round(entry.per100g.protein * ratio * 10) / 10;
      const carbs = Math.round(entry.per100g.carbs * ratio * 10) / 10;
      const fat = Math.round(entry.per100g.fat * ratio * 10) / 10;
      const fiber = Math.round(entry.per100g.fiber * ratio * 10) / 10;

      const servCal = Math.round(entry.per100g.calories * servingRatio);
      const servProt = Math.round(entry.per100g.protein * servingRatio * 10) / 10;

      return `${entry.displayName} — Nutrition & Contents:
• Per ${targetGrams}g: ${cal} kcal | Protein: ${prot}g | Carbs: ${carbs}g | Fat: ${fat}g | Fiber: ${fiber}g
• Standard Serving (${entry.servingLabel}): ${servCal} kcal & ${servProt}g protein
• What It Contains: ${entry.containsDetails}
• Vitamins & Minerals: ${entry.vitaminsAndMinerals}
• Nutritionist Tip: ${entry.healthBenefitAndTip}`;
    }
  }

  return null;
}
