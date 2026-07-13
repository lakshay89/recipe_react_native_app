export const INGREDIENTS = [
  // Spices
  { id: 'asafoetida', name: 'Asafoetida', category: 'Spices', aliases: ['Hing'], recommendedUnits: ['Pinch', 'Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'bay-leaf', name: 'Bay Leaf', category: 'Spices', aliases: ['Tejpatta'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'black-cardamom', name: 'Black Cardamom', category: 'Spices', aliases: ['Badi Elaichi'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'black-pepper', name: 'Black Pepper', category: 'Spices', aliases: ['Kali Mirch'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'carom-seeds', name: 'Carom Seeds', category: 'Spices', aliases: ['Ajwain'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'cinnamon', name: 'Cinnamon', category: 'Spices', aliases: ['Dalchini'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'cloves', name: 'Cloves', category: 'Spices', aliases: ['Laung'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'coriander-seeds', name: 'Coriander Seeds', category: 'Spices', aliases: ['Dhaniya Seeds', 'Sabut Dhaniya'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'cumin-seeds', name: 'Cumin Seeds', category: 'Spices', aliases: ['Jeera'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'fenugreek-seeds', name: 'Fenugreek Seeds', category: 'Spices', aliases: ['Methi Dana'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'garam-masala', name: 'Garam Masala', category: 'Spices', aliases: ['Whole Spice Blend'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'green-cardamom', name: 'Green Cardamom', category: 'Spices', aliases: ['Hari Elaichi'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'mustard-seeds', name: 'Mustard Seeds', category: 'Spices', aliases: ['Rai', 'Sarso'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'nigella-seeds', name: 'Nigella Seeds', category: 'Spices', aliases: ['Kalonji'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },
  { id: 'nutmeg', name: 'Nutmeg', category: 'Spices', aliases: ['Jaiphal'], recommendedUnits: ['Piece', 'Pinch', 'Gram (g)'] },
  { id: 'saffron', name: 'Saffron', category: 'Spices', aliases: ['Kesar', 'Zafran'], recommendedUnits: ['Pinch', 'Thread', 'Gram (g)'] },
  { id: 'turmeric', name: 'Turmeric', category: 'Spices', aliases: ['Haldi'], recommendedUnits: ['Teaspoon (tsp)', 'Gram (g)'] },

  // Vegetables
  { id: 'onion', name: 'Onion', category: 'Vegetables', aliases: ['Pyaz'], recommendedUnits: ['Piece', 'Gram (g)', 'Cup'] },
  { id: 'garlic', name: 'Garlic', category: 'Vegetables', aliases: ['Lahsun'], recommendedUnits: ['Clove', 'Gram (g)', 'Teaspoon (tsp)'] },
  { id: 'tomato', name: 'Tomato', category: 'Vegetables', aliases: ['Tamatar'], recommendedUnits: ['Piece', 'Gram (g)', 'Cup'] },
  { id: 'potato', name: 'Potato', category: 'Vegetables', aliases: ['Aloo'], recommendedUnits: ['Piece', 'Gram (g)', 'Kilogram (kg)'] },
  { id: 'green-chilli', name: 'Green Chilli', category: 'Vegetables', aliases: ['Hari Mirch'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'ginger', name: 'Ginger', category: 'Vegetables', aliases: ['Adrak'], recommendedUnits: ['Gram (g)', 'Teaspoon (tsp)'] },
  { id: 'spinach', name: 'Spinach', category: 'Vegetables', aliases: ['Palak'], recommendedUnits: ['Bunch', 'Gram (g)', 'Cup'] },
  { id: 'eggplant', name: 'Brinjal', category: 'Vegetables', aliases: ['Baingan', 'Aubergine'], recommendedUnits: ['Piece', 'Gram (g)'] },
  { id: 'okra', name: 'Okra', category: 'Vegetables', aliases: ['Bhindi', 'Ladies Finger'], recommendedUnits: ['Gram (g)', 'Piece'] },

  // Poultry & Meat
  { id: 'chicken', name: 'Chicken', category: 'Poultry', aliases: ['Murgh', 'Chicken Pieces'], recommendedUnits: ['Gram (g)', 'Kilogram (kg)', 'Piece'] },
  { id: 'goat', name: 'Goat', category: 'Meat', aliases: ['Mutton', 'Bakri ka meat'], recommendedUnits: ['Gram (g)', 'Kilogram (kg)'] },

  // Dairy
  { id: 'milk', name: 'Cow Milk', category: 'Dairy Products', aliases: ['Doodh'], recommendedUnits: ['Millilitre (ml)', 'Litre (L)', 'Cup'] },
  { id: 'curd', name: 'Curd (Dahi)', category: 'Dairy Products', aliases: ['Yogurt', 'Dahi'], recommendedUnits: ['Gram (g)', 'Cup', 'Tablespoon (tbsp)'] },
  { id: 'paneer', name: 'Paneer', category: 'Dairy Products', aliases: ['Cottage Cheese'], recommendedUnits: ['Gram (g)', 'Cup'] },
  { id: 'ghee', name: 'Ghee', category: 'Oil & Fats', aliases: ['Clarified Butter'], recommendedUnits: ['Tablespoon (tbsp)', 'Millilitre (ml)', 'Gram (g)'] },

  // Seafood
  { id: 'hilsa', name: 'Hilsa', category: 'Seafood', aliases: ['Ilish'], recommendedUnits: ['Gram (g)', 'Piece', 'Kilogram (kg)'] },
  { id: 'prawns', name: 'Sea prawns', category: 'Seafood', aliases: ['Jhinga', 'Chingri'], recommendedUnits: ['Gram (g)', 'Piece'] },

  // Sweeteners
  { id: 'sugar', name: 'Sugar (Chini)', category: 'Sweeteners', aliases: ['Chini'], recommendedUnits: ['Teaspoon (tsp)', 'Tablespoon (tbsp)', 'Gram (g)', 'Cup'] },
  { id: 'jaggery', name: 'Jaggery (Gur)', category: 'Sweeteners', aliases: ['Gur'], recommendedUnits: ['Gram (g)', 'Cup', 'Tablespoon (tbsp)'] },

  // Grains
  { id: 'basmati-rice', name: 'Basmati Rice', category: 'Rice', aliases: ['Rice'], recommendedUnits: ['Gram (g)', 'Cup', 'Kilogram (kg)'] },
  { id: 'wheat-flour', name: 'Wheat Flour (Atta)', category: 'Flours & Starches', aliases: ['Atta'], recommendedUnits: ['Gram (g)', 'Cup', 'Kilogram (kg)'] },
  { id: 'chickpea-flour', name: 'Besan (Gram Flour)', category: 'Flours & Starches', aliases: ['Besan', 'Gram Flour'], recommendedUnits: ['Gram (g)', 'Cup', 'Tablespoon (tbsp)'] }
];
