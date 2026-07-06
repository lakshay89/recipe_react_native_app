export const ALL_COLLECTIONS = [
  {
    id: "mughal-cuisine",
    title: "Mughal Cuisine",
    subtitle: "Royal kitchens, slow cooking, aromatic spices",
    description: "A curated archive of recipes influenced by Mughal-era court food traditions.",
    coverImage: require("../../../assets/images/thali.png"),
    period: "16th–18th Century",
    region: "North India",
    recipeCount: 3,
    contributors: 12,
    tags: ["Royal", "Slow Cooked", "Spiced"],
    timeline: [
      {
        year: "1526",
        title: "Mughal culinary style begins",
        description: "Central Asian, Persian, and local Indian culinary styles merged in North Indian kitchens."
      },
      {
        year: "1638",
        title: "Shahjahanabad Royal Feasts",
        description: "Compilation of court recipes using saffron, almonds, and slow-cooking techniques (Dum)."
      }
    ],
    recipes: [
      {
        id: "mughal-1",
        title: "Kashmiri Dum Aloo",
        localName: "Dum Oluv",
        nativeScript: "दम आलू",
        region: "Jammu & Kashmir",
        district: "Srinagar",
        history: "A classic slow-cooked potato dish nurtured under the Mughal governors in Kashmir, featuring fennel, ginger, and Kashmiri chili.",
        ingredients: "Potatoes (8 pcs) - peeled and pricked\nKashmiri Red Chili Powder (2 tsp)\nFennel Powder (1.5 tsp)\nDry Ginger Powder (1 tsp)\nMustard Oil (4 tbsp)\nSalt (1 tsp)",
        instructions: "Step 1: Deep fry pricked potatoes until golden brown.\nStep 2: Whisk spices in water and simmer with potatoes under heavy lid (Dum) for 20 minutes.",
        prepTime: 20,
        cookTime: 30,
        totalTime: 50,
        serves: "4",
        status: "Published",
        coverImage: "thali.png",
        heritageSource: "Grandmother → Mother → Me"
      },
      {
        id: "mughal-2",
        title: "Heritage Royal Thali",
        localName: "Shahi Thali",
        region: "Rajasthan",
        district: "Jaipur",
        history: "A collection of royal preparations served on a brass platter, showcasing slow-cooking court styles.",
        ingredients: "Basmati Rice (2 cups)\nSpiced Lentils (1 cup)\nFlatbreads (4 pcs)\nSaffron sweets (2 pcs)",
        instructions: "Step 1: Prepare individual curries and grains.\nStep 2: Assemble in small metal bowls and serve on a large thali platter.",
        prepTime: 30,
        cookTime: 45,
        totalTime: 75,
        serves: "4",
        status: "Published",
        coverImage: "thali.png",
        heritageSource: "Historical Book"
      }
    ],
    relatedCollections: ["silk-route", "temple-food"]
  },
  {
    id: "vedic-recipes",
    title: "Vedic Recipes",
    subtitle: "Ancient vegetarian traditions, satvik ingredients",
    description: "Traditional dishes documented in ancient Vedic scriptures, emphasizing purity, seasonal harvests, and herbal balance.",
    coverImage: require("../../../assets/images/kelapatta.png"),
    period: "1500–500 BCE",
    region: "Indo-Gangetic Plains",
    recipeCount: 1,
    contributors: 8,
    tags: ["Satvik", "Vegetarian", "Seasonal"],
    timeline: [
      {
        year: "1000 BCE",
        title: "Soma and Grain Offerings",
        description: "Earliest records of barley, honey, and clarified butter (ghee) preparations in rituals."
      }
    ],
    recipes: [
      {
        id: "vedic-1",
        title: "Barley Honey Porridge",
        localName: "Yava Yavagu",
        region: "Uttar Pradesh",
        district: "Varanasi",
        history: "An ancient energizing breakfast gruel sweetened with forest honey and spiced with green cardamom.",
        ingredients: "Broken Barley (1 cup)\nWater/Milk (3 cups)\nClarified Butter/Ghee (1 tbsp)\nRaw Forest Honey (2 tbsp)\nCardamom pods (2 pcs)",
        instructions: "Step 1: Roast barley in ghee until fragrant.\nStep 2: Boil in water/milk until soft. Stir in honey after cooling slightly.",
        prepTime: 5,
        cookTime: 15,
        totalTime: 20,
        serves: "2",
        status: "Published",
        coverImage: "kelapatta.png",
        heritageSource: "Historical Book"
      }
    ],
    relatedCollections: ["temple-food", "himalayan-cuisine"]
  },
  {
    id: "silk-route",
    title: "Silk Route Recipes",
    subtitle: "Central Asian exchanges, spice corridors",
    description: "An archival trace of nomadic food patterns and aromatic ingredients traded across borders.",
    coverImage: require("../../../assets/images/kesar.png"),
    period: "2nd Century BCE - 15th Century CE",
    region: "Kashmir & Ladakh",
    recipeCount: 2,
    contributors: 15,
    tags: ["Cross-Border", "Spices", "Trade Routes"],
    timeline: [
      {
        year: "120 CE",
        title: "Kushan Empire Trading hubs",
        description: "Ladakh and Kashmir became active crossroads where saffron, walnuts, and dried fruits were exchanged for silk."
      }
    ],
    recipes: [
      {
        id: "silk-1",
        title: "Kashmiri Kahwa",
        localName: "Mogil Kahwa",
        region: "Jammu & Kashmir",
        district: "Srinagar",
        history: "A green tea infusion brewed with saffron threads, crushed green cardamom, cinnamon bark, and sliced almonds.",
        ingredients: "Green Tea Leaves (1 tsp)\nSaffron threads (10-12 pcs)\nCardamom pods (3 pcs)\nCinnamon stick (1 inch)\nSliced Almonds (1 tbsp)\nHoney (optional)",
        instructions: "Step 1: Boil spices in water for 5 minutes.\nStep 2: Turn off flame, add green tea leaves and saffron. Steep for 3 minutes, strain and serve garnished with almonds.",
        prepTime: 5,
        cookTime: 5,
        totalTime: 10,
        serves: "2",
        status: "Published",
        coverImage: "kesar.png",
        heritageSource: "Community Elder"
      }
    ],
    relatedCollections: ["mughal-cuisine", "himalayan-cuisine"]
  },
  {
    id: "grand-trunk-road",
    title: "Grand Trunk Road",
    subtitle: "Highway dhabas, clay ovens, clay cups",
    description: "Traveler food cultures across South Asia's historic highway, from Kabul to Kolkata.",
    coverImage: require("../../../assets/images/tandoorroti.png"),
    period: "3rd Century BCE - Present",
    region: "Punjab to Bengal",
    recipeCount: 2,
    contributors: 22,
    tags: ["Clay Oven", "Traveler Food", "Rustical"],
    timeline: [
      {
        year: "1540",
        title: "Sher Shah Suri reconstructs highway",
        description: "Caravanserais (inns) established every few miles, serving traveler clay-pot stews and flatbreads."
      }
    ],
    recipes: [
      {
        id: "gtr-1",
        title: "Winter Tandoor Bread",
        localName: "Tandoori Roti",
        region: "Punjab",
        district: "Amritsar",
        history: "Fresh whole-wheat dough baked against the hot inner clay walls of a tandoor oven, brushed with butter.",
        ingredients: "Whole wheat flour (2 cups)\nWater (1 cup)\nSalt (0.5 tsp)\nGhee for brushing",
        instructions: "Step 1: Knead smooth dough and rest.\nStep 2: Roll out thick circles and bake inside a clay tandoor oven until blistered.",
        prepTime: 15,
        cookTime: 5,
        totalTime: 20,
        serves: "3",
        status: "Published",
        coverImage: "tandoorroti.png",
        heritageSource: "Village Cook"
      }
    ],
    relatedCollections: ["mughal-cuisine", "coastal-cuisine"]
  },
  {
    id: "himalayan-cuisine",
    title: "Himalayan Cuisine",
    subtitle: "Altitude preservation, fermented grains, barley",
    description: "Nourishing, warming preparations preserved under extreme sub-zero weather conditions.",
    coverImage: require("../../../assets/images/silbata.png"),
    period: "Ancient - Present",
    region: "Himalayan Belt",
    recipeCount: 1,
    contributors: 9,
    tags: ["High Altitude", "Fermented", "Warmth"],
    timeline: [
      {
        year: "800 CE",
        title: "Trans-Himalayan Salt Trade",
        description: "Yak butter tea and dry tsampa barley flour became foundational staples for high-altitude caravans."
      }
    ],
    recipes: [
      {
        id: "himalaya-1",
        title: "Yak Butter Salt Tea",
        localName: "Po Cha",
        region: "Ladakh",
        district: "Leh",
        history: "A thick warming tea churned with strong black tea leaves, salted yak butter, and milk.",
        ingredients: "Black Tea Leaves (2 tbsp)\nWater (2 cups)\nSalt (0.5 tsp)\nYak Butter (1 tbsp)\nMilk (0.5 cup)",
        instructions: "Step 1: Boil tea leaves in water for 15 minutes.\nStep 2: Strain and churn vigorously with butter, salt, and milk until emulsified.",
        prepTime: 5,
        cookTime: 15,
        totalTime: 20,
        serves: "2",
        status: "Published",
        coverImage: "silbata.png",
        heritageSource: "Tribal Community"
      }
    ],
    relatedCollections: ["silk-route", "tribal-cuisine"]
  },
  {
    id: "temple-food",
    title: "Temple Food",
    subtitle: "Divine offerings, brass pots, wood fire",
    description: "Preserved vegetarian recipes cooked daily as prasadam sacred offerings inside ancient temple shrines.",
    coverImage: require("../../../assets/images/sweets.png"),
    period: "10th Century - Present",
    region: "Pan-India Shrines",
    recipeCount: 2,
    contributors: 18,
    tags: ["Prasadam", "No Onion Garlic", "Sacred"],
    timeline: [
      {
        year: "1150",
        title: "Jagannath Puri Kitchens established",
        description: "The world's largest heritage wood-fired kitchen began serving 56 daily dishes cooked in clay pots stacked vertically."
      }
    ],
    recipes: [
      {
        id: "temple-1",
        title: "Sweet Milk Peda",
        localName: "Dharwad Peda",
        region: "Karnataka",
        district: "Dharwad",
        history: "Slowly simmered milk solids caramelized to golden brown, dusted with powdered sugar and cardamom.",
        ingredients: "Milk (2 liters)\nSugar (1 cup)\nCardamom Powder (0.5 tsp)\nGhee (2 tbsp)",
        instructions: "Step 1: Reduce milk solids in iron pan, stirring constantly.\nStep 2: Add sugar, caramelize to golden brown, shape into round pedas and roll in sugar powder.",
        prepTime: 10,
        cookTime: 50,
        totalTime: 60,
        serves: "6",
        status: "Published",
        coverImage: "sweets.png",
        heritageSource: "Temple Kitchen"
      }
    ],
    relatedCollections: ["vedic-recipes", "coastal-cuisine"]
  },
  {
    id: "tribal-cuisine",
    title: "Tribal Cuisine",
    subtitle: "Foraged greens, bamboo shoots, wood-fired tubers",
    description: "Indigenous culinary systems based on forest foraging, seasonal tubers, and earth oven roasting.",
    coverImage: require("../../../assets/images/silbata.png"),
    period: "Pre-Historic - Present",
    region: "Central & Northeast Forests",
    recipeCount: 1,
    contributors: 14,
    tags: ["Foraged", "Earth Roasted", "Organic"],
    timeline: [
      {
        year: "Pre-Historic",
        title: "Stone Grinding & Earth Ovens",
        description: "Neolithic grinding stones discovered in forest zones, matching methods still used to paste roots and wild herbs."
      }
    ],
    recipes: [
      {
        id: "tribal-1",
        title: "Roasted Forest Yam",
        localName: "Mati Alu Bhaja",
        region: "Jharkhand",
        district: "Ranchi",
        history: "Wild forest yams wrapped in sal leaves and slow-cooked under hot charcoal ashes.",
        ingredients: "Forest Yam tubers (2 pcs)\nSalt (1 tsp)\nMustard Paste (1 tbsp)\nTurmeric (0.5 tsp)",
        instructions: "Step 1: Wash, slice, and rub yams with mustard paste.\nStep 2: Wrap in wet sal leaves and roast under open wood coals for 30 minutes.",
        prepTime: 15,
        cookTime: 30,
        totalTime: 45,
        serves: "3",
        status: "Published",
        coverImage: "silbata.png",
        heritageSource: "Tribal Community"
      }
    ],
    relatedCollections: ["himalayan-cuisine", "vedic-recipes"]
  },
  {
    id: "coastal-cuisine",
    title: "Coastal Cuisine",
    subtitle: "Coconut milk, sour kokum, clay pots",
    description: "Maritime food cultures utilizing coastal souring agents, coconut shells, and clay pots.",
    coverImage: require("../../../assets/images/dal.png"),
    period: "Ancient - Present",
    region: "Indian Peninsula Coastline",
    recipeCount: 2,
    contributors: 20,
    tags: ["Maritime", "Kokum Souring", "Clay Pot"],
    timeline: [
      {
        year: "1st Century CE",
        title: "Roman maritime spice trade",
        description: "Muziris and Malabar coastal ports traded black pepper and dry ginger with Roman spice vessels."
      }
    ],
    recipes: [
      {
        id: "coastal-1",
        title: "Monsoon Kadhai Lentil",
        localName: "Kadhai Dal",
        region: "Goa / Konkan",
        district: "North Goa",
        history: "A regional monsoon specialty cooked in iron pots, simmered with kokum petals and coconut cream.",
        ingredients: "Toor Dal (1 cup)\nKokum petals (3 pcs)\nCoconut Milk (0.5 cup)\nCurry leaves (1 sprig)\nMustard seeds (1 tsp)",
        instructions: "Step 1: Boil lentils with turmeric until tender.\nStep 2: Heat mustard seeds, curry leaves, add lentils, kokum petals, and coconut milk, simmer for 5 minutes.",
        prepTime: 10,
        cookTime: 20,
        totalTime: 30,
        serves: "4",
        status: "Published",
        coverImage: "dal.png",
        heritageSource: "Grandmother → Mother → Me"
      }
    ],
    relatedCollections: ["temple-food", "grand-trunk-road"]
  }
];
