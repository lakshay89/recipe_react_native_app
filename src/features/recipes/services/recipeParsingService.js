import offlineService from '../../../shared/services/offlineService';
import { getAllIngredients, normalizeIngredientName } from './masterIngredientService';
import { API_BASE_URL } from '../../../core/config/apiConfig';

export const recipeParsingService = {
  /**
   * Parses raw recipe text into structured JSON fields.
   * Calls the backend AI parsing route if online; otherwise, runs client-side fallback.
   */
  async parseRecipeText(rawText) {
    if (offlineService.isConnected()) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/recipes/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: rawText,
            source: 'image_scan',
            allowSuggestions: true,
            preserveOriginalLanguage: true
          }),
        });
        
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            return {
              ...resJson.data,
              isOfflineParsed: false,
            };
          }
        }
      } catch (e) {
        console.warn('Backend parsing failed, falling back to local offline parser.', e);
      }
    }

    return this.parseLocalOffline(rawText);
  },

  /**
   * Standardizes ingredients against the master taxonomy to prevent duplicates
   */
  async alignIngredientsWithMaster(extractedIngredients) {
    const masterList = await getAllIngredients();
    
    return extractedIngredients.map((item, idx) => {
      const extName = (item.name || '').trim();
      const normName = normalizeIngredientName(extName);
      
      const matched = masterList.find(m => {
        const mNorm = normalizeIngredientName(m.name);
        return mNorm === normName || (m.aliases || []).some(a => normalizeIngredientName(a) === normName);
      });

      if (matched) {
        return {
          id: matched.id,
          name: matched.name,
          category: matched.category,
          quantity: item.quantity || '',
          unit: item.unit || matched.recommendedUnits[0] || 'Gram (g)',
          notes: item.notes || '',
        };
      }

      return {
        id: `custom-${Date.now()}-${idx}`,
        name: extName,
        category: 'Other',
        quantity: item.quantity || '',
        unit: item.unit || 'Piece',
        notes: item.notes || '',
        isCustom: true,
      };
    });
  },

  guessUnit(quantStr) {
    const qLower = quantStr.toLowerCase();
    if (qLower.includes('tsp') || qLower.includes('teaspoon')) return 'Teaspoon (tsp)';
    if (qLower.includes('tbsp') || qLower.includes('tablespoon')) return 'Tablespoon (tbsp)';
    if (qLower.includes('ml') || qLower.includes('milliliter') || qLower.includes('millilitre')) return 'Millilitre (ml)';
    if (qLower.includes('kg') || qLower.includes('kilogram')) return 'Kilogram (kg)';
    if (qLower.includes('g') || qLower.includes('gm') || qLower.includes('gram')) return 'Gram (g)';
    if (qLower.includes('cup')) return 'Cup';
    if (qLower.includes('pinch')) return 'Pinch';
    if (qLower.includes('litre') || qLower.includes('liter') || qLower.includes('l')) return 'Litre (l)';
    return 'Piece';
  },

  /**
   * Lightweight local parser using regex heuristics returning the structured schema layout
   */
  async parseLocalOffline(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    let recipeName = '';
    let serves = '4';
    let prepTime = '';
    let cookTime = '';
    let rawIngredients = [];
    let cookingStepsList = [];
    let region = '';

    let parsingSection = 'none';

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      
      if (lineLower.includes('ingredients:') || lineLower.includes('सामग्री:')) {
        parsingSection = 'ingredients';
        continue;
      } else if (lineLower.includes('method:') || lineLower.includes('instructions:') || lineLower.includes('विधि:')) {
        parsingSection = 'method';
        continue;
      }

      if (!recipeName && lines.indexOf(line) === 0) {
        recipeName = line.replace(/recipe/gi, '').trim();
      }

      const prepMatch = line.match(/(?:prep|preparation)\s*(?:time)?\s*:\s*(\d+\s*\w+)/i);
      if (prepMatch) prepTime = prepMatch[1];

      const cookMatch = line.match(/(?:cook|cooking)\s*(?:time)?\s*:\s*(\d+\s*\w+)/i);
      if (cookMatch) cookTime = cookMatch[1];

      const servesMatch = line.match(/(?:serves|servings|सर्विंग्स)\s*:\s*(\d+)/i);
      if (servesMatch) serves = servesMatch[1];

      const regionMatch = line.match(/(?:region|state|गुजरात|पंजाब|उत्तर प्रदेश)\s*:\s*(\w+)/i);
      if (regionMatch) region = regionMatch[1];

      if (parsingSection === 'ingredients') {
        const ingMatch = line.match(/^(?:-|\*|\d+)?\s*(\d+(?:\/\d+)?\s*(?:g|kg|ml|tsp|tbsp|cup|piece|gm|gram|tbsp|threads|litre|cup)s?)\s+(.+)/i);
        if (ingMatch) {
          rawIngredients.push({
            name: ingMatch[2].trim(),
            quantity: ingMatch[1].replace(/[a-zA-Z\s]/g, '').trim(),
            unit: this.guessUnit(ingMatch[1]),
            notes: '',
          });
        } else {
          const cleanedName = line.replace(/^[-*•\d\s]+/g, '').trim();
          if (cleanedName.length > 2) {
            rawIngredients.push({
              name: cleanedName,
              quantity: '',
              unit: 'Piece',
              notes: '',
            });
          }
        }
      } else if (parsingSection === 'method') {
        const stepText = line.replace(/^\d+[\.\s\-]+/g, '').trim();
        if (stepText.length > 5) {
          cookingStepsList.push(stepText);
        }
      }
    }

    const aligned = await this.alignIngredientsWithMaster(rawIngredients);
    const wrap = (val, provenance = 'extracted') => ({
      value: val || '',
      provenance: val ? provenance : 'missing',
      confidence: 'high',
      sourceEvidence: '',
      suggestionReason: ''
    });

    const ingredients = aligned.map(ing => ({
      name: wrap(ing.name),
      quantity: wrap(ing.quantity),
      unit: wrap(ing.unit, 'normalized'),
      preparation: wrap(ing.notes)
    }));

    const cookingSteps = cookingStepsList.map((step, idx) => ({
      stepText: wrap(step),
      stepNumber: idx + 1
    }));

    return {
      title: wrap(recipeName || 'Untitled Offline Parse'),
      localName: wrap(scriptIsHindi(text) ? recipeName : ''),
      nativeScript: wrap(scriptIsHindi(text) ? 'Devanagari' : ''),
      servings: wrap(serves),
      prepTime: wrap(prepTime),
      cookTime: wrap(cookTime),
      restingTime: wrap(''),
      state: wrap(region),
      district: wrap(''),
      village: wrap(''),
      traditionalCookware: wrap(''),
      heritageSource: wrap(''),
      sourcePerson: wrap(''),
      sourceType: wrap(''),
      culturalAssociation: wrap(''),
      notes: wrap(''),
      ingredients,
      cookingSteps,
      missingFields: ['title', 'state', 'prepTime', 'cookTime'].filter(f => {
        if (f === 'title') return !recipeName;
        if (f === 'state') return !region;
        if (f === 'prepTime') return !prepTime;
        if (f === 'cookTime') return !cookTime;
        return false;
      }),
      aiSuggestions: [],
      clarificationQuestions: [],
      warnings: ['Offline mode: values parsed locally using heuristics.'],
      isOfflineParsed: true
    };
  }
};

const scriptIsHindi = (text) => {
  return /[\u0900-\u097F]/.test(text);
};

export default recipeParsingService;
