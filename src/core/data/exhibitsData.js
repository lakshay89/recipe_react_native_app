export const EXHIBITS = [
  {
    id: 'grand-feasts',
    title: 'Grand Feasts of Ancient India',
    subtitle: 'Royal dining traditions, ceremonial banquets, and regional culinary exchange.',
    category: 'Historical Exhibit',
    era: 'Ancient India (Maurya & Gupta Eras)',
    readingTime: '8 min read',
    coverImage: require('../../assets/images/thali.png'),
    introduction: 'The story of ceremonial dining in ancient India reflects an era of lavish banquets, meticulously documented state kitchens, and diverse regional exchange. Court chronicles describe royal feasts featuring hundreds of dishes prepared using ancient clay-pot methods, charcoal grills, and regional grain combinations that formed the root of classical Indian gastronomy.',
    timeline: [
      {
        year: '300 BCE',
        title: 'Early Maurya Feasting Protocols',
        description: 'Maurya court manuals establish strict culinary codes, royal food tasters, and recipes for spiced wild grains.',
      },
      {
        year: '400 CE',
        title: 'Gupta Gold Banquets',
        description: 'Gupta records describe slow-simmered rice puddings, honey sweets, and saffron-spiced courtly drinks.',
      },
    ],
    sections: [
      {
        heading: 'The Royal Kitchen Hierarchy',
        content: 'Historical records show that royal kitchens were managed by a state superintendent who oversaw expert breadmakers, spice mixers, and slow-cooking masters. Food was classified according to seasonal guidelines, balancing temperature, spices, and grains to matches the health of courtly families.',
        image: require('../../assets/images/silbata.png'),
        caption: 'The ancient stone mortar (Sil-Bata) used to grind seasonal spices.',
      },
      {
        heading: 'Ceremonial Dining Customs',
        content: 'Banquets were highly choreographed social ceremonies. Guests sat on custom embroidered floor mats in designated orders of rank. Meals were served on gold platters, terracotta leaf-bowls, or large fresh plantain leaves, accompanied by herb-infused mountain waters.',
      }
    ],
    gallery: [
      {
        id: 'g1',
        image: require('../../assets/images/thali.png'),
        caption: 'Classic Royal Feasting Platter.',
      },
      {
        id: 'g2',
        image: require('../../assets/images/dal.png'),
        caption: 'Clay-pot simmering technique illustration.',
      },
    ],
    relatedRecipes: [
      { id: '1', title: 'Monsoon Kadhai Dal', region: 'Uttar Pradesh', image: 'dal.png' },
      { id: '2', title: 'Saffron Kheer', region: 'Kashmir', image: 'kesar.png' },
    ],
    references: [
      { title: 'Food Traditions of Maurya India', source: 'Imperial Archives Institute', year: '2016' },
      { title: 'Royal Gastronomy of the Classical Era', source: 'Historical Cuisine Quarterly', year: '2021' },
    ],
    narrationDuration: '4m 32s',
  },
  {
    id: 'spice-routes',
    title: 'Spices of the Malabar Trade Routes',
    subtitle: 'The maritime trade routes that shaped the culinary world map.',
    category: 'Maritime History',
    era: '1st Century CE to Medieval Era',
    readingTime: '10 min read',
    coverImage: require('../../assets/images/chaicup.png'),
    introduction: 'The spice routes of the Malabar coast turned ports like Calicut and Cochin into global cultural melting pots. Cardamom, black pepper, and cinnamon were traded across the Arabian Sea, blending Indian spice mixtures into Greco-Roman, Arab, and European culinary histories.',
    timeline: [
      {
        year: '45 CE',
        title: 'Roman Ships Reach Muziris',
        description: 'Monsoon winds carry Roman merchant fleets to the Malabar coast, trading gold coins directly for black pepper.',
      },
      {
        year: '1498 CE',
        title: 'Portuguese Naval Incursion',
        description: 'Vasco da Gama arrives in Calicut, initiating a new era of maritime monopoly and colonial conflict over pepper.',
      },
    ],
    sections: [
      {
        heading: 'Black Gold of the Malabar',
        content: 'Black pepper, often referred to as "black gold", was valued so highly it was accepted as currency. The unique soil and heavy monsoon rains of the Western Ghats produced pepper of unmatched aroma and heat.',
        image: require('../../assets/images/chaicup.png'),
        caption: 'Traditional Indian spices ready for merchant export.',
      }
    ],
    gallery: [
      {
        id: 'g3',
        image: require('../../assets/images/chaicup.png'),
        caption: 'Indigenous spice preparations.',
      }
    ],
    relatedRecipes: [
      { id: '3', title: 'Winter Tandoor Bread', region: 'Punjab', image: 'tandoorroti.png' },
    ],
    references: [
      { title: 'The Pepper Coast Chronicles', source: 'Kerala Historical Society', year: '2012' },
    ],
    narrationDuration: '5m 12s',
  },
  {
    id: 'royal-kitchens',
    title: 'Royal Kitchens of Medieval India',
    subtitle: 'Sultanate feasts, Mughal innovations, and the birth of classic biryani.',
    category: 'Dynastic Cuisine',
    era: '12th to 18th Century CE',
    readingTime: '12 min read',
    coverImage: require('../../assets/images/kesar.png'),
    introduction: 'The royal kitchens of medieval India merged Persian kitchen practices with indigenous spices, giving rise to rich curries, flatbreads, and aromatic rice biryanis that came to define royal dining hall displays.',
    timeline: [
      {
        year: '1526 CE',
        title: 'Founding of Mughal Courtly Dining',
        description: 'Baburs chefs introduce central Asian fruits, breadmaking, and spit-grilling to Delhi kitchens.',
      },
      {
        year: '1630 CE',
        title: 'Imperial Kitchen Manuals (Ain-i-Akbari)',
        description: 'Detailing exact ingredient weights, spices, and courtly recipes favored by Emperor Akbar.',
      },
    ],
    sections: [
      {
        heading: 'Aromatic Infusions',
        content: 'Mughal kitchen staff pioneered the use of rosewater, saffron, and crushed almonds in savory dishes. Slow-cooking under seal (Dum) allowed meats and rice to absorb deep aromas without burning.',
        image: require('../../assets/images/kesar.png'),
        caption: 'Pure saffron threads used for imperial aromatic desserts.',
      }
    ],
    gallery: [
      {
        id: 'g4',
        image: require('../../assets/images/kesar.png'),
        caption: 'Saffron harvesting illustration.',
      }
    ],
    relatedRecipes: [
      { id: '2', title: 'Saffron Kheer', region: 'Kashmir', image: 'kesar.png' },
    ],
    references: [
      { title: 'The Ain-i-Akbari Gastronomy Translation', source: 'Museum Press Delhi', year: '2005' },
    ],
    narrationDuration: '6m 02s',
  },
  {
    id: 'temple-cuisine',
    title: 'Sacred Temple Cuisine Traditions',
    subtitle: 'No-onion-no-garlic vegetarian heritage and the concept of Mahaprasad.',
    category: 'Sacred Traditions',
    era: 'Ancient India to Present',
    readingTime: '9 min read',
    coverImage: require('../../assets/images/kelapatta.png'),
    introduction: 'India\'s temples have served as crucial preservation centers for vegetarian culinary arts. Prepared without onion, garlic, or imported vegetables, these foods represent pure culinary archetypes.',
    timeline: [
      {
        year: '1100 CE',
        title: 'Puri Jagannath Temple System',
        description: 'The massive temple kitchen system begins cooking Mahaprasad using clay pots stacked in column heaters.',
      },
    ],
    sections: [
      {
        heading: 'The Sacred Stacked Clay Pots',
        content: 'In Puri, meals are cooked in earthen pots stacked seven high over a single fire. Amazingly, the top pot cooks first, a custom method representing spiritual harmony and ancient heat dynamics.',
        image: require('../../assets/images/kelapatta.png'),
        caption: 'Mahaprasad served traditionally on sacred plantain leaves.',
      }
    ],
    gallery: [
      {
        id: 'g5',
        image: require('../../assets/images/kelapatta.png'),
        caption: 'Traditional Puri temple serving platter.',
      }
    ],
    relatedRecipes: [
      { id: '1', title: 'Monsoon Kadhai Dal', region: 'Uttar Pradesh', image: 'dal.png' },
    ],
    references: [
      { title: 'The Sacred Kitchens of Jagannath', source: 'Orissa Archives Press', year: '2019' },
    ],
    narrationDuration: '4m 55s',
  }
];
export default EXHIBITS;
