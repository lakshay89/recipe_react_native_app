import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, ScrollView, Alert, Switch } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../../core/theme/theme';
import { useAuth } from '../../../shared/services/AuthContext';
import Header from '../../../shared/components/Header';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import Card from '../../../shared/components/Card';
import { recipeDraftService } from '../../recipes/services/recipeDraftService';

export const EditRecipeScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const { myRecipes, editRecipe, submitUpdateRequest, resubmitRecipe } = useAuth();
  
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    if (route.params?.isDraft) {
      recipeDraftService.getDraftById(recipeId).then((found) => {
        if (found) setRecipe(found);
      });
    } else {
      const found = myRecipes.find((r) => r.id === recipeId);
      if (found) setRecipe(found);
    }
  }, [recipeId, myRecipes, route.params]);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [localName, setLocalName] = useState('');
  const [nativeScript, setNativeScript] = useState('');
  const [altNames, setAltNames] = useState('');
  const [history, setHistory] = useState('');
  
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [gpsCoords, setGpsCoords] = useState('');
  const [isBorderRegion, setIsBorderRegion] = useState(false);

  const [heritageSource, setHeritageSource] = useState('');
  const [whoTaughtYou, setWhoTaughtYou] = useState('');
  const [numGenerations, setNumGenerations] = useState('');
  const [approxAge, setApproxAge] = useState('');

  const [serves, setServes] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [prepStepsText, setPrepStepsText] = useState('');
  const [cookingStepsText, setCookingStepsText] = useState('');
  const [traditionalTips, setTraditionalTips] = useState('');

  const [festival, setFestival] = useState('');
  const [season, setSeason] = useState('');
  const [community, setCommunity] = useState('');
  const [tribe, setTribe] = useState('');
  const [dietType, setDietType] = useState('');
  const [rarityStatus, setRarityStatus] = useState('');
  const [cookingVessel, setCookingVessel] = useState('');
  const [cookingMedium, setCookingMedium] = useState('');
  const [heatSource, setHeatSource] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || '');
      setLocalName(recipe.localName || '');
      setNativeScript(recipe.nativeScript || '');
      setAltNames(recipe.altNames || '');
      setHistory(recipe.history || '');

      setRegion(recipe.region || '');
      setDistrict(recipe.district || '');
      setTehsil(recipe.tehsil || '');
      setVillage(recipe.village || '');
      setGpsCoords(recipe.gpsCoords || '');
      setIsBorderRegion(recipe.isBorderRegion || false);

      setHeritageSource(recipe.heritageSource || '');
      setWhoTaughtYou(recipe.whoTaughtYou || '');
      setNumGenerations(recipe.numGenerations ? String(recipe.numGenerations) : '');
      setApproxAge(recipe.approxAge ? String(recipe.approxAge) : '');

      setServes(recipe.serves ? String(recipe.serves) : '4');
      setIngredientsText(recipe.ingredients || '');

      setPrepTime(recipe.prepTime ? String(recipe.prepTime) : '');
      setCookTime(recipe.cookTime ? String(recipe.cookTime) : '');
      setTotalTime(recipe.totalTime ? String(recipe.totalTime) : '');
      if (recipe.prepStepsList && recipe.prepStepsList.length > 0) {
        setPrepStepsText(recipe.prepStepsList.map((s) => s.detail).join('\n'));
      } else {
        setPrepStepsText('');
      }
      if (recipe.cookingStepsList && recipe.cookingStepsList.length > 0) {
        setCookingStepsText(recipe.cookingStepsList.map((s) => s.detail).join('\n'));
      } else {
        setCookingStepsText(recipe.instructions || '');
      }
      setTraditionalTips(recipe.traditionalTips || '');

      setFestival(recipe.festival || '');
      setSeason(recipe.season || '');
      setCommunity(recipe.community || '');
      setTribe(recipe.tribe || '');
      setDietType(recipe.dietType || '');
      setRarityStatus(recipe.rarityStatus || '');
      setCookingVessel(recipe.cookingVessel || '');
      setCookingMedium(recipe.cookingMedium || '');
      setHeatSource(recipe.heatSource || '');
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Edit Archival Record" showBack={true} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Recipe record not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    // Basic Val
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'Recipe Name is required';
    if (!history.trim()) newErrors.history = 'Heritage story description is required';
    if (!region.trim()) newErrors.region = 'Origin State is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    const prepStepsList = prepStepsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => ({ detail: line.trim() }));

    const cookingStepsList = cookingStepsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => ({ detail: line.trim() }));

    const combinedText = [
      prepStepsText.trim() ? `[Preparation Steps]\n${prepStepsText.trim()}` : '',
      cookingStepsText.trim() ? `[Cooking Steps]\n${cookingStepsText.trim()}` : '',
    ].filter(Boolean).join('\n\n');

    const fieldsPayload = {
      title,
      localName,
      nativeScript,
      altNames,
      history,
      region,
      district,
      tehsil,
      village,
      gpsCoords,
      isBorderRegion,
      heritageSource,
      whoTaughtYou,
      numGenerations: numGenerations ? parseInt(numGenerations, 10) : '',
      approxAge: approxAge ? parseInt(approxAge, 10) : '',
      serves,
      ingredients: ingredientsText,
      prepTime: prepTime ? parseInt(prepTime, 10) : '',
      cookTime: cookTime ? parseInt(cookTime, 10) : '',
      totalTime: totalTime ? parseInt(totalTime, 10) : '',
      instructions: combinedText,
      prepStepsList,
      cookingStepsList,
      traditionalTips,
      festival,
      season,
      community,
      tribe,
      dietType,
      rarityStatus,
      cookingVessel,
      cookingMedium,
      heatSource,
    };

    // Enforce business logic on edit targets
    if (route.params?.isDraft) {
      const updatedDraft = {
        ...recipe,
        ...fieldsPayload,
        ingredientsList: recipe.ingredientsList || [],
        prepStepsList: fieldsPayload.prepStepsList,
        cookingStepsList: fieldsPayload.cookingStepsList,
      };
      recipeDraftService.saveDraft(updatedDraft, recipe.currentStep || 'RecipeIdentity').then(() => {
        Alert.alert(
          'Draft Updated',
          'Your draft recipe curation has been saved successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      });
      return;
    }

    const isPublished = recipe.status === 'Approved' || recipe.status === 'Published';
    const isRejected = recipe.status === 'Rejected';

    if (isPublished) {
      // Create Update Request instead of overwriting directly
      submitUpdateRequest(recipe.id, fieldsPayload);
      Alert.alert(
        'Update Request Submitted',
        'Your updated recipe has been submitted for heritage verification.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'MyArchive' }) }]
      );
    } else if (isRejected) {
      // Re-submit rejected items
      resubmitRecipe(recipe.id, fieldsPayload);
      Alert.alert(
        'Recipe Resubmitted',
        'Your recipe card has been updated and resubmitted for admin review.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'MyArchive' }) }]
      );
    } else {
      // Direct edits for drafts/pending review
      editRecipe(recipe.id, fieldsPayload);
      Alert.alert(
        'Recipe Updated',
        'Your recipe card has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainApp', { screen: 'MyArchive' }) }]
      );
    }
  };

  const formattedDate = recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header title="Edit Archival Record" showBack={true} showAvatar={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Info Box */}
        <Card variant="heritage" style={styles.statusInfoCard}>
          <View style={styles.statusMetaRow}>
            <Text style={styles.infoLabel}>STATUS: <Text style={styles.infoVal}>{recipe.status}</Text></Text>
            <Text style={styles.infoLabel}>SUBMITTED: <Text style={styles.infoVal}>{formattedDate}</Text></Text>
          </View>
          <Text style={styles.guidelineDesc}>
            {recipe.status === 'Approved' || recipe.status === 'Published'
              ? "Note: Published entries are locked. Saving edits creates an 'Update Request' subject to curator review."
              : "Updates made to drafts or pending items will modify the record directly."}
          </Text>
        </Card>

        {/* Section 1: Identity */}
        <Text style={styles.formSectionTitle}>1. Recipe Identity</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <Input
            label="Recipe Name (English) *"
            value={title}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, title: '' }));
              setTitle(text);
            }}
            error={errors.title}
          />
          <Input
            label="Local Regional Name"
            value={localName}
            onChangeText={setLocalName}
          />
          <Input
            label="Native Script Script Name"
            value={nativeScript}
            onChangeText={setNativeScript}
          />
          <Input
            label="Alternative Dialect Names"
            value={altNames}
            onChangeText={setAltNames}
          />
          <Input
            label="Story / Detailed Lore *"
            value={history}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, history: '' }));
              setHistory(text);
            }}
            multiline={true}
            numberOfLines={4}
            error={errors.history}
          />
        </Card>

        {/* Section 2: Location */}
        <Text style={styles.formSectionTitle}>2. Geographic Mappings</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <Input
            label="State / Origin Region *"
            value={region}
            onChangeText={(text) => {
              setErrors((prev) => ({ ...prev, region: '' }));
              setRegion(text);
            }}
            error={errors.region}
          />
          <Input
            label="District"
            value={district}
            onChangeText={setDistrict}
          />
          <Input
            label="Tehsil"
            value={tehsil}
            onChangeText={setTehsil}
          />
          <Input
            label="Village / Community Settlement"
            value={village}
            onChangeText={setVillage}
          />
          <Input
            label="GPS Coordinates"
            value={gpsCoords}
            onChangeText={setGpsCoords}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Cross-Border Region Toggle</Text>
            <Switch
              value={isBorderRegion}
              onValueChange={setIsBorderRegion}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={isBorderRegion ? COLORS.white : COLORS.background}
            />
          </View>
        </Card>

        {/* Section 3: Heritage Source */}
        <Text style={styles.formSectionTitle}>3. Lineage & Source</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <Input
            label="Heritage Source (e.g. Grandmother)"
            value={heritageSource}
            onChangeText={setHeritageSource}
          />
          <Input
            label="Who Taught You?"
            value={whoTaughtYou}
            onChangeText={whoTaughtYou}
          />
          <View style={styles.dualFieldRow}>
            <Input
              label="Generations"
              value={numGenerations}
              onChangeText={setNumGenerations}
              keyboardType="number-pad"
              style={styles.halfInput}
            />
            <Input
              label="Approx. Age (Years)"
              value={approxAge}
              onChangeText={setApproxAge}
              keyboardType="number-pad"
              style={styles.halfInput}
            />
          </View>
        </Card>

        {/* Section 4: Ingredients */}
        <Text style={styles.formSectionTitle}>4. Ingredients (Serves - {serves})</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <Input
            label="Serves Count"
            value={serves}
            onChangeText={setServes}
            keyboardType="number-pad"
          />
          <Input
            label="Ingredients (List entries, separated by newlines)"
            value={ingredientsText}
            onChangeText={setIngredientsText}
            multiline={true}
            numberOfLines={5}
          />
        </Card>

        {/* Section 5: Method */}
        <Text style={styles.formSectionTitle}>5. Timings & Preparation</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <View style={styles.triFieldRow}>
            <Input
              label="Prep (m)"
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="number-pad"
              style={styles.triInput}
            />
            <Input
              label="Cook (m)"
              value={cookTime}
              onChangeText={setCookTime}
              keyboardType="number-pad"
              style={styles.triInput}
            />
            <Input
              label="Total (m)"
              value={totalTime}
              onChangeText={setTotalTime}
              keyboardType="number-pad"
              style={styles.triInput}
            />
          </View>
          <Input
            label="Preparation Steps (One step per line)"
            placeholder="e.g. Wash and chop onions..."
            value={prepStepsText}
            onChangeText={setPrepStepsText}
            multiline={true}
            numberOfLines={4}
          />
          <Input
            label="Cooking Steps (One step per line)"
            placeholder="e.g. Cook on slow heat..."
            value={cookingStepsText}
            onChangeText={setCookingStepsText}
            multiline={true}
            numberOfLines={6}
          />
          <Input
            label="Traditional Cooking Tips"
            value={traditionalTips}
            onChangeText={setTraditionalTips}
            multiline={true}
            numberOfLines={2}
          />
        </Card>

        {/* Section 6: Culture */}
        <Text style={styles.formSectionTitle}>6. Cultural Classifications</Text>
        <Card variant="default" style={styles.formGroupCard}>
          <Input label="Festival Occasion" value={festival} onChangeText={setFestival} />
          <Input label="Season" value={season} onChangeText={setSeason} />
          <Input label="Community Origin" value={community} onChangeText={setCommunity} />
          <Input label="Tribe Group" value={tribe} onChangeText={setTribe} />
          <Input label="Diet Classification" value={dietType} onChangeText={setDietType} />
          <Input label="Rarity Level" value={rarityStatus} onChangeText={setRarityStatus} />
          <Input label="Traditional Cookware Vessel" value={cookingVessel} onChangeText={setCookingVessel} />
          <Input label="Traditional Oil/Medium" value={cookingMedium} onChangeText={setCookingMedium} />
          <Input label="Traditional Heat Source / Fuel" value={heatSource} onChangeText={setHeatSource} />
        </Card>

        {/* Action Panel */}
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.actionBtn}
          />
          <Button
            title="Submit Update"
            variant="primary"
            onPress={handleSubmit}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.bodyBold,
    color: COLORS.error,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 110,
  },
  statusInfoCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statusMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  infoVal: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  guidelineDesc: {
    ...FONTS.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  formSectionTitle: {
    ...FONTS.titleMedium,
    color: COLORS.secondary,
    fontSize: 16,
    marginVertical: SPACING.xs,
    marginLeft: 4,
  },
  formGroupCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
    ...SHADOWS.soft,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  switchLabel: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.text,
  },
  dualFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  triFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  triInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});

export default EditRecipeScreen;
